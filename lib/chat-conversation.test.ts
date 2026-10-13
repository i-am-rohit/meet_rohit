import assert from "node:assert/strict";
import test from "node:test";
import { resolveAnswer } from "./chat-answer";
import { normalizeQuestion } from "./chat-intent";
import { enrichAnswerLinks, safeHref } from "./chat-links";
import { applyServerTurn, emptySession, parseSession, type ChatSession } from "./chat-memory";
import type { ResolvedAnswer } from "./chat-answer";

function ask(session: ChatSession, question: string): { session: ChatSession; result: ResolvedAnswer } {
  const result = resolveAnswer(question, session);
  return {
    result,
    session: applyServerTurn(session, question, result.label, result.body, {
      entryId: result.entryId,
      topic: result.topic,
      section: result.section,
      intent: result.intent,
      entity: result.entity,
    }),
  };
}

test("repairs typos before matching", () => {
  assert.equal(normalizeQuestion("in whcih comapnies"), "in which companies");
  assert.equal(normalizeQuestion("and putup?"), "and put up");
});

test("greetings introduce the assistant and do not repeat a profile", () => {
  const hi = ask(emptySession(), "Hi");
  assert.equal(hi.result.body, "Hi! I'm Rohit's AI assistant. How can I help you?");
  assert.equal(hi.result.intent, "greeting");
  assert.match(ask(emptySession(), "hello").result.body, /^Hello! I'm Rohit's AI assistant/);
  assert.match(ask(emptySession(), "namaste").result.body, /^Namaste! I'm Rohit's AI assistant/);
  assert.doesNotMatch(hi.result.body, /v1\.0|knowledge base|approximately 6/i);
});

test("hometown, current location, experience, and companies stay in context", () => {
  let session = emptySession();
  const from = ask(session, "where are you from?");
  session = from.session;
  assert.match(from.result.body, /Pauri Garhwal, Uttarakhand/);
  assert.match(from.result.body, /born and raised in Delhi/);
  assert.equal(session.intent, "hometown");

  const stay = ask(session, "and putup?");
  session = stay.session;
  assert.match(stay.result.body, /currently based in Delhi, India/);
  assert.doesNotMatch(stay.result.body, /Pauri/);
  assert.equal(session.intent, "current_location");

  const experience = ask(session, "do you have experience");
  session = experience.session;
  assert.match(experience.result.body, /approximately 6 years of experience/);
  assert.match(experience.result.body, /Computer Vision/);
  assert.doesNotMatch(experience.result.body, /Power BI|DAX|footfall/i);
  assert.equal(session.intent, "total_experience");

  const companies = ask(session, "in whcih comapnies");
  session = companies.session;
  assert.match(companies.result.body, /VLCC Healthcare/);
  assert.match(companies.result.body, /SISL Infotech/);
  assert.match(companies.result.body, /GlobalLogic/);
  assert.match(companies.result.body, /Prakhar Software Solutions/);
  assert.equal(session.intent, "employment_history");
  assert.equal(session.turns.length, 4);
});

test("the full hi-to-companies conversation stays relevant", () => {
  const lines = ["Hi", "Where are you from?", "And putup?", "Do you have experience?", "In whcih comapnies?"];
  let session = emptySession();
  const answers: string[] = [];
  for (const line of lines) {
    const step = ask(session, line);
    session = step.session;
    answers.push(step.result.body);
  }
  assert.equal(answers[0], "Hi! I'm Rohit's AI assistant. How can I help you?");
  assert.equal(answers[1], "Rohit's hometown is Pauri Garhwal, Uttarakhand, but he was born and raised in Delhi.");
  assert.equal(answers[2], "He's currently based in Delhi, India.");
  assert.equal(
    answers[3],
    "Rohit has approximately 6 years of experience in AI, Machine Learning, Computer Vision, NLP, and Digital Transformation.",
  );
  assert.equal(
    answers[4],
    "Rohit has worked at VLCC Healthcare, SISL Infotech, GlobalLogic (Google-related projects), and Prakhar Software Solutions.",
  );
  assert.ok(answers.every((answer) => !/v1\.0|localhost/i.test(answer)));
});

test("a general experience question does not collapse into Power BI", () => {
  const seeded = {
    ...emptySession(),
    topic: "Power BI",
    section: "Power BI & Enterprise Analytics",
    intent: "technical_skills",
    entity: "Power BI",
  };
  const { result } = ask(seeded, "do you have experience?");
  assert.match(result.body, /approximately 6 years/);
  assert.doesNotMatch(result.body, /DAX|Power Query|Row-Level Security/);
});

test("Indian English put up means current location", () => {
  const { result } = ask(emptySession(), "Where do you put up?");
  assert.equal(result.body, "He's currently based in Delhi, India.");
  assert.equal(result.intent, "current_location");
});

test("short follow-ups use the previous intent", () => {
  let session = ask(emptySession(), "where are you from?").session;
  const where = ask(session, "where?");
  assert.match(where.result.body, /currently based in Delhi/);

  session = ask(emptySession(), "do you have experience").session;
  const which = ask(session, "which companies?");
  assert.match(which.result.body, /Prakhar Software Solutions/);
});

test("section headings are not shown in answers", () => {
  const { result } = ask(emptySession(), "What is Rohit's career objective?");
  assert.match(result.body, /AI Architect/);
  assert.doesNotMatch(result.body, /##|Section \d+/);
});

test("education follow-ups stay on the degree, college, and percentage", () => {
  let session = ask(emptySession(), "education").session;
  assert.match(ask(session, "?").result.body, /Would you like to know more about Rohit's education\?/);
  assert.equal(
    ask(session, "which college?").result.body,
    "He completed his M.Tech at NIET, Greater Noida, and his B.Tech at Jamia Hamdard.",
  );
  assert.equal(ask(session, "what percentage?").result.body, "He scored 84% in his M.Tech and 70% in his B.Tech.");
});

test("education lists both degrees, and a named degree stays specific", () => {
  const both = ask(emptySession(), "what is your education?");
  assert.match(both.result.body, /\*\*M\.Tech in Artificial Intelligence\*\*/);
  assert.match(both.result.body, /NIET, Greater Noida/);
  assert.match(both.result.body, /84%/);
  assert.match(both.result.body, /\*\*B\.Tech in Electronics and Communication\*\*/);
  assert.match(both.result.body, /Jamia Hamdard/);
  assert.match(both.result.body, /70%/);

  const master = ask(emptySession(), "what is your master?");
  assert.match(master.result.body, /M\.Tech in Artificial Intelligence/);
  assert.doesNotMatch(master.result.body, /B\.Tech|Jamia/);
  assert.equal(ask(master.session, "which college?").result.body, "He completed his M.Tech at NIET, Greater Noida.");

  const bachelor = ask(emptySession(), "what is your bachelor?");
  assert.match(bachelor.result.body, /B\.Tech in Electronics and Communication/);
  assert.match(bachelor.result.body, /Jamia Hamdard/);
  assert.doesNotMatch(bachelor.result.body, /M\.Tech|NIET/);
  assert.equal(ask(bachelor.session, "what percentage?").result.body, "He scored 70% in his B.Tech.");
});

test("the listed questions stay accurate and do not leak headings", () => {
  const lines = [
    "hi",
    "how are you?",
    "what is rohit experience?",
    "education",
    "?",
    "what your experience",
    "How to reach him",
    "what your achievements",
    "Core strengths",
    "What does he do now?",
    "where are you from?",
    "and putup?",
    "in whcih comapnies?",
  ];
  let session = emptySession();
  const answers: string[] = [];
  for (const line of lines) {
    const step = ask(session, line);
    session = step.session;
    answers.push(step.result.body);
    assert.equal(step.result.label, "");
    assert.doesNotMatch(step.result.body, /##\s*Section|\*\*What are|\*\*Experience\*\*|\*\*Ask Me\*\*/);
  }
  assert.equal(answers[0], "Hi! I'm Rohit's AI assistant. How can I help you?");
  assert.match(answers[1], /I'm doing well, thank you/);
  assert.match(answers[2], /approximately 6 years of experience/);
  assert.match(answers[3], /M\.Tech in Artificial Intelligence/);
  assert.match(answers[3], /NIET, Greater Noida, completed in 2022 with 84%/);
  assert.equal(answers[4], "Would you like to know more about Rohit's education?");
  assert.match(answers[5], /approximately 6 years of experience/);
  assert.match(answers[6], /\[meetrohit\.in\]\(https:\/\/meetrohit\.in\/\)/);
  assert.match(answers[6], /\[LinkedIn\]\(https:\/\/www\.linkedin\.com\/in\/rohit-gusain-4aa831142\/\)/);
  assert.match(answers[6], /mailto:jhurohit@gmail\.com/);
  assert.match(answers[7], /\*\*SWISS:\*\*/);
  assert.match(answers[7], /\*\*Geonexis:\*\*/);
  assert.match(answers[7], /175\+ VLCC locations/);
  assert.match(answers[7], /25 enterprise dashboards/);
  assert.doesNotMatch(answers[7], /Section 3|digital transformation programmes/);
  assert.match(answers[8], /AI solution planning/);
  assert.match(answers[9], /Programme Manager – AI & Digital Transformation at VLCC Healthcare Limited/);
  assert.match(answers[10], /Pauri Garhwal/);
  assert.match(answers[11], /currently based in Delhi, India/);
  assert.match(answers[12], /VLCC Healthcare/);
  assert.match(answers[12], /GlobalLogic \(Google-related projects\)/);
  assert.ok(answers.every((answer) => !/## Section|localhost/.test(answer)));
});

test("formatted answers stay grounded for education, role, and achievements", () => {
  const education = ask(emptySession(), "Education");
  assert.match(education.result.body, /\*\*M\.Tech in Artificial Intelligence\*\*/);
  assert.match(education.result.body, /\*\*B\.Tech in Electronics and Communication\*\*/);
  assert.match(education.result.body, /Jamia Hamdard/);
  assert.doesNotMatch(education.result.body, /##|Section \d+/);

  const role = ask(emptySession(), "What does Rohit do now?");
  assert.match(role.result.body, /\*\*Programme Manager – AI & Digital Transformation at VLCC Healthcare Limited\*\*/);
  assert.match(role.result.body, /SWISS, Geonexis, and Power BI analytics/);

  const achievements = ask(emptySession(), "Tell me about his achievements.");
  assert.match(achievements.result.body, /1\. \*\*SWISS:\*\*/);
  assert.match(achievements.result.body, /175\+ VLCC locations/);
  assert.match(achievements.result.body, /2\. \*\*Geonexis:\*\*/);
  assert.match(achievements.result.body, /3\. \*\*Power BI:\*\*/);
  assert.doesNotMatch(achievements.result.body, /## Section/);
});

test("education does not return the leadership answer", () => {
  const { result } = ask(emptySession(), "education");
  assert.match(result.body, /\*\*M\.Tech in Artificial Intelligence\*\*/);
  assert.match(result.body, /Jamia Hamdard/);
  assert.match(result.body, /70%/);
  assert.doesNotMatch(result.body, /VLCC responsibilities|##|Section 13/);
  assert.equal(result.label, "");
});

test("unknown questions ask for clarification instead of a biography", () => {
  const { result } = ask(emptySession(), "what is the weather on mars");
  assert.match(result.body, /hasn't been confirmed/i);
  assert.doesNotMatch(result.body, /Programme Manager|approximately 6/);
});

test("markdown links stay absolute and are not nested", () => {
  assert.equal(safeHref("https://meetrohit.in/"), "https://meetrohit.in/");
  assert.equal(safeHref("https://www.linkedin.com/in/rohit-gusain-4aa831142/"), "https://www.linkedin.com/in/rohit-gusain-4aa831142/");
  assert.equal(safeHref("mailto:jhurohit@gmail.com"), "mailto:jhurohit@gmail.com");
  assert.equal(safeHref("meetrohit.in"), "https://meetrohit.in/");
  assert.equal(safeHref("not a url"), null);

  const once = enrichAnswerLinks(
    "Visit https://meetrohit.in/ or https://www.linkedin.com/in/rohit-gusain-4aa831142/ or jhurohit@gmail.com.",
  );
  assert.match(once, /\[meetrohit\.in\]\(https:\/\/meetrohit\.in\/\)/);
  assert.match(once, /\[LinkedIn\]\(https:\/\/www\.linkedin\.com\/in\/rohit-gusain-4aa831142\/\)/);
  assert.match(once, /\[jhurohit@gmail\.com\]\(mailto:jhurohit@gmail\.com\)/);
  assert.equal(enrichAnswerLinks(once), once);
  assert.doesNotMatch(once, /localhost|127\.0\.0\.1/);
});

test("contact links stay absolute", () => {
  const { result } = ask(emptySession(), "How to reach him");
  assert.match(result.body, /\[meetrohit\.in\]\(https:\/\/meetrohit\.in\/\)/);
  assert.match(result.body, /\[LinkedIn\]\(https:\/\/www\.linkedin\.com\/in\/rohit-gusain-4aa831142\/\)/);
  assert.match(result.body, /mailto:jhurohit@gmail\.com/);
  assert.doesNotMatch(result.body, /localhost/);
});

test("project technology follow-ups stay on that project", () => {
  const session = ask(emptySession(), "What is Geonexis?").session;
  const tech = ask(session, "Which technologies are used?");
  assert.match(tech.result.body, /biometric|Whisper|LocalAuthentication|Ollama/i);
  assert.doesNotMatch(tech.result.body, /hasn't been confirmed/i);
});

test("session memory keeps the last turns and intent", () => {
  let session = emptySession();
  for (const line of ["hi", "where are you from?", "and putup?", "do you have experience", "in whcih comapnies"]) {
    session = ask(session, line).session;
  }
  const restored = parseSession(JSON.parse(JSON.stringify(session)));
  assert.ok(restored);
  assert.equal(restored.turns.length, 5);
  assert.equal(restored.intent, "employment_history");
  assert.equal(restored.turns[1]?.intent, "hometown");
  assert.equal(restored.turns[3]?.intent, "total_experience");
  assert.match(restored.turns.at(-1)?.answer ?? "", /VLCC Healthcare/);
  const followed = ask(restored, "where?");
  assert.match(followed.result.body, /Delhi|VLCC|confirmed/i);
});
