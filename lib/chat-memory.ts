import { classifyQuestion } from "@/lib/chat-intent";
import { getEntryById, matchKnowledge, nextInSection, type KnowledgeMatch } from "@/lib/knowledge-base";

/** How many recent turns stay in full. Older turns collapse into a short summary. */
const RECENT_TURNS = 8;
const MAX_TURNS = 10;
const MAX_TEXT = 2000;

export type ChatTurn = {
  question: string;
  answer: string;
  label: string;
  entryId: number | null;
  section: string | null;
  topic: string | null;
  intent: string | null;
  entity: string | null;
};

export type ChatSession = {
  id: string;
  turns: ChatTurn[];
  /** Compressed stand-in for turns that scrolled out of the recent window. */
  summary: string;
  topic: string | null;
  section: string | null;
  /** Last detected intent, such as hometown or total_experience. */
  intent: string | null;
  /** Last discussed entity or project. */
  entity: string | null;
};

export type AnswerContext = {
  latestQuestion: string;
  resolvedQuestion: string;
  topic: string | null;
  section: string | null;
  recentTurns: { question: string; answer: string }[];
  olderSummary: string;
};

const TOPICS: { label: string; pattern: RegExp }[] = [
  { label: "Geonexis", pattern: /\bgeonexis\b/i },
  { label: "SWISS", pattern: /\bswiss\b/i },
  { label: "FUSION", pattern: /\bfusion\b/i },
  { label: "Shadon", pattern: /\bshadon\b/i },
  { label: "Power BI", pattern: /\bpower\s*bi\b|\bpowerbi\b|\bdax\b/i },
  { label: "HR chatbot", pattern: /\bhr chatbot\b|\brasa\b|\bspacy\b/i },
  { label: "research papers", pattern: /\bresearch papers?\b|\bieee\b|\bspringer\b/i },
];

const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
}

export function emptySession(): ChatSession {
  return { id: createSessionId(), turns: [], summary: "", topic: null, section: null, intent: null, entity: null };
}

function clip(value: unknown, max = MAX_TEXT): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Reject stored data that is not a conversation for this browser. */
export function parseSession(raw: unknown): ChatSession | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<ChatSession>;
  if (typeof value.id !== "string" || !SESSION_ID.test(value.id)) return null;
  if (!Array.isArray(value.turns)) return null;

  const turns: ChatTurn[] = value.turns.slice(-MAX_TURNS).flatMap((turn) => {
    if (!turn || typeof turn !== "object") return [];
    const item = turn as Partial<ChatTurn>;
    const question = clip(item.question);
    const answer = clip(item.answer);
    if (!question || !answer) return [];
    return [
      {
        question,
        answer,
        label: clip(item.label, 240) || question,
        entryId: typeof item.entryId === "number" ? item.entryId : null,
        section: clip(item.section, 120) || null,
        topic: clip(item.topic, 80) || null,
        intent: clip(item.intent, 80) || null,
        entity: clip(item.entity, 80) || null,
      },
    ];
  });

  const last = turns.at(-1);
  return {
    id: value.id,
    turns,
    summary: clip(value.summary, 500),
    topic: clip(value.topic, 80) || last?.topic || null,
    section: clip(value.section, 120) || last?.section || null,
    intent: clip(value.intent, 80) || last?.intent || null,
    entity: clip(value.entity, 80) || last?.entity || null,
  };
}

export function namedTopic(text: string): string | null {
  return TOPICS.find((topic) => topic.pattern.test(text))?.label ?? null;
}

function isFollowUp(query: string): boolean {
  const q = query.toLowerCase().trim();
  if (/^(hi+|hello+|hey+|heya|howdy|yo|hola|namaste|namaskar|good morning|good afternoon|good evening|good night|thanks|thank you|ok|okay|how are you|how're you|how's it going|how is it going|what's up|whats up|sup|kaise ho)\b/.test(q)) return false;
  if (/^(tell me more|more details|more about that|go on|continue|elaborate|and\b|also\b)/.test(q)) return true;
  if (/\b(it|its|that|this|those|the same|that project|this project|the project|which technolog|what technolog|what stack|the stack)\b/.test(q)) {
    return true;
  }
  if (/\brohit\b/.test(q) && !/\b(it|that|this)\b/.test(q)) return false;
  if (/^(what about|how about|how many|does it|is it|can it|which)\b/.test(q)) return true;
  return false;
}

function resolveQuestion(query: string, topic: string | null): string {
  if (!topic || namedTopic(query)) return query;
  if (!isFollowUp(query)) return query;

  if (/^(tell me more|more details|more about that|go on|continue|elaborate)\b/i.test(query)) {
    return `more confirmed details about ${topic}`;
  }

  return query
    .replace(/\b(that|this|the)\s+project\b/gi, topic)
    .replace(/\bit\b/gi, topic)
    .replace(/\b(which|what)\s+technolog(?:y|ies)(?:\s+are|\s+is)?(?:\s+used)?\b/gi, `which technologies does ${topic} use`)
    .concat(namedTopic(query) ? "" : "");
}

function technologyAnswer(topic: string): { entryId: number; text: string } | null {
  const line = (id: number) => getEntryById(id)?.answer ?? "";
  if (topic === "SWISS") {
    const text = line(85);
    return text ? { entryId: 85, text } : null;
  }
  if (topic === "Power BI") {
    const text = line(115);
    return text ? { entryId: 115, text } : null;
  }
  if (topic === "Geonexis") {
    const text = [98, 101, 106, 107].map(line).filter(Boolean).join(" ");
    return text ? { entryId: 98, text } : null;
  }
  if (topic === "HR chatbot") {
    const text = line(138);
    return text ? { entryId: 138, text } : null;
  }
  return null;
}

function asksForTechnology(query: string): boolean {
  return /\b(technolog\w*|stack|built with|tools)\b/i.test(query);
}

function asksForMore(query: string): boolean {
  return /^(tell me more|more details|more about that|go on|continue|elaborate|explain this|explain that)\b/i.test(query.trim());
}

function cleanAnswer(text: string): string {
  return text
    .replace(/\s*##\s+Section\s+\d+\b[^\n]*/gi, "")
    .split("\n")
    .map((line) => line.replace(/^#{1,6}\s+/, "").trim())
    .filter(Boolean)
    .join("\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

const CLARIFICATION =
  "That hasn't been confirmed in Rohit's profile. Ask about his work, projects, education, hometown, or how to reach him.";

function withTopic(query: string, topic: string | null): string {
  const resolved = resolveQuestion(query, topic);
  if (!topic || namedTopic(resolved) || !isFollowUp(query)) return resolved;
  return `${resolved} ${topic}`;
}

function fold(session: ChatSession): ChatSession {
  if (session.turns.length <= RECENT_TURNS + 2) return session;
  const older = session.turns.slice(0, session.turns.length - RECENT_TURNS);
  const topics = [...new Set(older.map((turn) => turn.topic).filter(Boolean))];
  const summary = [session.summary, topics.length ? `Earlier topics: ${topics.join(", ")}.` : ""]
    .filter(Boolean)
    .join(" ")
    .slice(0, 500);
  return { ...session, turns: session.turns.slice(-RECENT_TURNS), summary };
}

function contextFor(session: ChatSession, latestQuestion: string, resolvedQuestion: string): AnswerContext {
  return {
    latestQuestion,
    resolvedQuestion,
    topic: session.topic,
    section: session.section,
    recentTurns: session.turns.slice(-4).map((turn) => ({
      question: turn.question,
      answer: turn.answer.slice(0, 180),
    })),
    olderSummary: session.summary,
  };
}

function matchGrounded(resolved: string, session: ChatSession, followUp: boolean): KnowledgeMatch | null {
  const asked = new Set(session.turns.map((turn) => turn.entryId).filter((id): id is number => id != null));
  const options = {
    previousSection: session.section,
    stickToSection: followUp,
    excludeIds: followUp ? [...asked] : [],
  };
  const first = matchKnowledge(resolved, options);
  if (!first) return matchKnowledge(resolved, { previousSection: session.section, stickToSection: followUp });
  if (followUp && asked.has(first.entry.id)) {
    return (
      matchKnowledge(resolved, { ...options, excludeIds: [...asked, first.entry.id] }) ??
      first
    );
  }
  return first;
}

export function answerInContext(question: string, session: ChatSession): {
  session: ChatSession;
  context: AnswerContext;
  match: KnowledgeMatch | null;
  composed: string | null;
} {
  const trimmed = question.trim().slice(0, MAX_TEXT);
  const classified = classifyQuestion(trimmed, session);
  const followUp = isFollowUp(trimmed);
  const switched = namedTopic(trimmed);
  const topic = switched ?? (followUp ? session.topic : null);
  const resolved = withTopic(trimmed, topic);
  const working: ChatSession = switched ? { ...session, topic: switched } : session;
  const asked = working.turns.map((turn) => turn.entryId).filter((id): id is number => id != null);

  let match: KnowledgeMatch | null = null;
  let composed: string | null = null;
  let intent: string | null = classified?.intent ?? null;
  let entity = classified?.entity ?? null;

  if (classified && classified.confidence >= 0.74) {
    const entry = getEntryById(classified.entryId);
    if (entry) match = { entry, score: Math.round(classified.confidence * 100) };
    composed = classified.answer;
  } else if (followUp && topic && asksForTechnology(trimmed) && technologyAnswer(topic)) {
    const tech = technologyAnswer(topic);
    if (tech) {
      const entry = getEntryById(tech.entryId);
      if (entry) {
        match = { entry, score: 100 };
        composed = tech.text;
        intent = "technical_skills";
        entity = topic;
      }
    }
  } else if (followUp && !switched && asksForMore(trimmed) && working.section) {
    const entry = nextInSection(working.section, asked, topic);
    if (entry) match = { entry, score: 100 };
    else composed = topic ? `Those are the confirmed points I have about ${topic}.` : "Those are the confirmed points I have on that topic.";
  } else {
    match = matchGrounded(
      resolved,
      followUp ? working : { ...working, section: switched ? null : working.section },
      followUp && !switched,
    );
  }

  const classifiedTopic = classified && classified.confidence >= 0.74 ? classified.topic : null;
  const nextTopic =
    classifiedTopic ??
    switched ??
    topic ??
    namedTopic(match?.entry.question ?? "") ??
    namedTopic(match?.entry.answer ?? "") ??
    working.topic;
  const nextSection = (classified && classified.confidence >= 0.74 ? classified.section : null) ?? match?.entry.section ?? (switched ? null : working.section);
  if (!composed && match) composed = cleanAnswer(match.entry.answer);
  if (!composed) {
    composed = CLARIFICATION;
    intent = working.intent;
    entity = working.entity;
  }
  const turn: ChatTurn = {
    question: trimmed,
    answer: "",
    label: "",
    entryId: match?.entry.id ?? null,
    section: nextSection,
    topic: nextTopic,
    intent,
    entity,
  };
  const next = fold({
    ...working,
    topic: nextTopic,
    section: nextSection,
    intent,
    entity,
    turns: [...working.turns, turn].slice(-MAX_TURNS),
  });

  return { session: next, context: contextFor(next, trimmed, resolved), match, composed };
}

export function rememberedAnswer(session: ChatSession, answer: string): ChatSession {
  if (!session.turns.length) return session;
  const turns = session.turns.slice();
  turns[turns.length - 1] = { ...turns[turns.length - 1], answer: answer.slice(0, MAX_TEXT) };
  return { ...session, turns };
}

/** Append a server answer onto the browser's full history. */
export function applyServerTurn(
  session: ChatSession,
  question: string,
  label: string,
  answer: string,
  meta: { entryId: number | null; topic: string | null; section: string | null; intent?: string | null; entity?: string | null },
): ChatSession {
  const intent = meta.intent ?? session.intent;
  const entity = meta.entity ?? session.entity;
  const turn: ChatTurn = {
    question: question.trim().slice(0, MAX_TEXT),
    answer: answer.slice(0, MAX_TEXT),
    label: label.slice(0, 240),
    entryId: meta.entryId,
    section: meta.section,
    topic: meta.topic,
    intent,
    entity,
  };
  return fold({
    ...session,
    topic: meta.topic ?? session.topic,
    section: meta.section ?? session.section,
    intent,
    entity,
    turns: [...session.turns, turn].slice(-MAX_TURNS),
  });
}

/** Store a greeting or resume reply without changing the discussion topic. */
export function appendExchange(session: ChatSession, question: string, label: string, answer: string): ChatSession {
  const turn: ChatTurn = {
    question: question.trim().slice(0, MAX_TEXT),
    answer: answer.slice(0, MAX_TEXT),
    label,
    entryId: null,
    section: session.section,
    topic: session.topic,
    intent: session.intent,
    entity: session.entity,
  };
  return fold({ ...session, turns: [...session.turns, turn].slice(-MAX_TURNS) });
}
