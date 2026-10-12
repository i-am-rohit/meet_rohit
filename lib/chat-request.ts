import { parseSession, type ChatSession } from "@/lib/chat-memory";

/** Recent turns sent with each request. Older turns stay in the summary. */
export const HISTORY_LIMIT = 8;
export const HISTORY_ANSWER_LIMIT = 180;
export const SUMMARY_LIMIT = 400;
export const QUESTION_LIMIT = 500;

export type ChatHistoryTurn = {
  question: string;
  answer: string;
  entryId: number | null;
  section: string | null;
  topic: string | null;
  intent: string | null;
  entity: string | null;
};

export type ChatRequest = {
  conversationId: string;
  question: string;
  topic: string | null;
  section: string | null;
  summary: string;
  intent: string | null;
  entity: string | null;
  history: ChatHistoryTurn[];
};

export type ChatResponse = {
  conversationId: string;
  label: string;
  answer: string;
  entryId: number | null;
  topic: string | null;
  section: string | null;
  intent: string | null;
  entity: string | null;
};

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Compact, validated context for one stateless request. */
export function buildChatRequest(session: ChatSession, question: string): ChatRequest {
  return {
    conversationId: session.id,
    question: question.trim().slice(0, QUESTION_LIMIT),
    topic: clip(session.topic, 80) || null,
    section: clip(session.section, 120) || null,
    summary: clip(session.summary, SUMMARY_LIMIT),
    intent: clip(session.intent, 80) || null,
    entity: clip(session.entity, 80) || null,
    history: session.turns.slice(-HISTORY_LIMIT).map((turn) => ({
      question: turn.question.slice(0, 200),
      answer: turn.answer.slice(0, HISTORY_ANSWER_LIMIT),
      entryId: typeof turn.entryId === "number" ? turn.entryId : null,
      section: clip(turn.section, 120) || null,
      topic: clip(turn.topic, 80) || null,
      intent: clip(turn.intent, 80) || null,
      entity: clip(turn.entity, 80) || null,
    })),
  };
}

/** Rebuild a session from the request body. Nothing is read from server memory. */
export function sessionFromRequest(body: unknown): { session: ChatSession; question: string } | null {
  if (!body || typeof body !== "object") return null;
  const value = body as Partial<ChatRequest>;
  const question = clip(value.question, QUESTION_LIMIT);
  if (!question) return null;
  const history = Array.isArray(value.history) ? value.history.slice(-HISTORY_LIMIT) : [];
  const session = parseSession({
    id: value.conversationId,
    summary: clip(value.summary, SUMMARY_LIMIT),
    topic: clip(value.topic, 80) || null,
    section: clip(value.section, 120) || null,
    intent: clip(value.intent, 80) || null,
    entity: clip(value.entity, 80) || null,
    turns: history.map((turn) => {
      if (!turn || typeof turn !== "object") return null;
      const item = turn as Partial<ChatHistoryTurn>;
      return {
        question: clip(item.question, 200),
        answer: clip(item.answer, HISTORY_ANSWER_LIMIT),
        label: clip(item.question, 200),
        entryId: typeof item.entryId === "number" ? item.entryId : null,
        section: clip(item.section, 120) || null,
        topic: clip(item.topic, 80) || null,
        intent: clip(item.intent, 80) || null,
        entity: clip(item.entity, 80) || null,
      };
    }),
  });
  if (!session) return null;
  return { session, question };
}

export function parseChatResponse(body: unknown, conversationId: string): ChatResponse | null {
  if (!body || typeof body !== "object") return null;
  const value = body as Partial<ChatResponse>;
  if (value.conversationId !== conversationId) return null;
  const answer = clip(value.answer, 4000);
  const label = clip(value.label, 240);
  if (!answer || !label) return null;
  return {
    conversationId,
    label,
    answer,
    entryId: typeof value.entryId === "number" ? value.entryId : null,
    topic: clip(value.topic, 80) || null,
    section: clip(value.section, 120) || null,
    intent: clip(value.intent, 80) || null,
    entity: clip(value.entity, 80) || null,
  };
}
