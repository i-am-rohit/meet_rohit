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
