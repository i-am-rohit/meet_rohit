import { knowledgeBase } from "@/lib/knowledge-base";
import { answerInContext, appendExchange, type ChatSession } from "@/lib/chat-memory";
import { enrichAnswerLinks } from "@/lib/chat-links";

const facts = knowledgeBase.profileFacts;
const resumePdf = "/resume/Rohit%20Gusain.pdf";

export type ResolvedAnswer = {
  label: string;
  body: string;
  entryId: number | null;
  topic: string | null;
  section: string | null;
  intent: string | null;
  entity: string | null;
};

/**
 * Answer one question from the verified knowledge base plus the session
 * supplied by the caller. This function stores nothing.
 */
const SALUTE =
  "hi+|hey+|heya|hello+|howdy|yo|hola|namaste|namaskar|namaskaram|good morning|good afternoon|good evening|good night";
const WELLBEING =
  "how are you(?: doing)?|how're you|how r you|how r u|how are u|how do you do|how's it going|how is it going|how have you been|what's up|whats up|sup|kaise ho(?: aap)?|kya haal(?: hai)?";
const GREETING = new RegExp(
  `^(?:(?:${SALUTE})(?:\\s+there)?(?:\\s+rohit)?(?:\\s+(?:${WELLBEING}))?|(?:${WELLBEING})(?:\\s+rohit)?)$`,
  "i",
);

function spokenGreeting(text: string): { label: string; body: string } | null {
  const q = text
    .toLowerCase()
    .replace(/[!.?,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!GREETING.test(q)) return null;

  const opening = /\bnamaste\b|\bnamaskar/.test(q)
    ? "Namaste"
    : /\bgood morning\b/.test(q)
      ? "Good morning"
      : /\bgood afternoon\b/.test(q)
        ? "Good afternoon"
        : /\bgood evening\b/.test(q)
          ? "Good evening"
          : /\bgood night\b/.test(q)
            ? "Good night"
            : /\bhello/.test(q)
              ? "Hello"
              : /\bhey/.test(q)
                ? "Hey"
                : /\bhowdy\b/.test(q)
                  ? "Howdy"
                  : /\bhola\b/.test(q)
                    ? "Hola"
                    : /\bhi+\b/.test(q)
                      ? "Hi"
                      : "";
  const help = "I'm Rohit's AI assistant. How can I help you?";
  const wellbeing = new RegExp(`(?:${WELLBEING})`, "i").test(q);
  if (!wellbeing && opening) return { label: opening, body: `${opening}! ${help}` };

  const hindi = /\bkaise ho\b|\bkya haal\b/.test(q);
  const lead = hindi ? "Main theek hoon, dhanyavaad." : "I'm doing well, thank you.";
  const label = opening || (hindi ? "Kaise ho" : /\bwhat'?s up\b|\bsup\b/.test(q) ? "What's up" : "How are you");
  const body = opening ? `${opening}! ${lead} ${help}` : `${lead} ${help}`;
  return { label, body };
}

export function resolveAnswer(input: string, session: ChatSession): ResolvedAnswer {
  const q = input.toLowerCase().trim();
  const greeting = spokenGreeting(input);
  if (greeting) {
    const next = appendExchange(session, input.trim(), greeting.label, greeting.body);
    return {
      label: greeting.label,
      body: greeting.body,
      entryId: null,
      topic: next.topic,
      section: next.section,
      intent: "greeting",
      entity: session.entity,
    };
  }

  if (/(resume|cv|curriculum)/.test(q)) {
    const body = enrichAnswerLinks(
      `You can [open my resume PDF](${resumePdf}), or contact me via [meetrohit.in](${facts.website}), [LinkedIn](${facts.linkedin}), or [${facts.email}](mailto:${facts.email}).`,
    );
    const next = appendExchange(session, input.trim(), "Resume", body);
    return { label: "Resume", body, entryId: null, topic: next.topic, section: next.section, intent: session.intent, entity: session.entity };
  }

  const result = answerInContext(input, session);
  const saved = result.session;
  const body = enrichAnswerLinks(result.composed ?? result.match?.entry.answer ?? "That hasn't been confirmed in Rohit's profile. Ask about his work, projects, education, hometown, or how to reach him.");
  return {
    label: saved.turns.at(-1)?.label || result.match?.entry.question || "Ask Me",
    body,
    entryId: result.match?.entry.id ?? null,
    topic: saved.topic,
    section: saved.section,
    intent: saved.intent,
    entity: saved.entity,
  };
}
