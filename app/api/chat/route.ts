import { resolveAnswer } from "@/lib/chat-answer";
import { sessionFromRequest } from "@/lib/chat-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stateless chat route for Vercel.
 * The browser sends the conversation id and a short history. This function
 * does not store conversations in memory, and it never returns server secrets.
 * Professional facts come only from the knowledge base.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = sessionFromRequest(body);
  if (!parsed) return Response.json({ error: "Invalid request" }, { status: 400 });

  const answer = resolveAnswer(parsed.question, parsed.session);
  return Response.json({
    conversationId: parsed.session.id,
    label: answer.label,
    answer: answer.body,
    entryId: answer.entryId,
    topic: answer.topic,
    section: answer.section,
    intent: answer.intent,
    entity: answer.entity,
  });
}
