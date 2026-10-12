"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { applyServerTurn, emptySession, parseSession, type ChatSession } from "@/lib/chat-memory";
import { resolveAnswer } from "@/lib/chat-answer";
import { buildChatRequest, parseChatResponse } from "@/lib/chat-request";
import { enrichAnswerLinks, safeHref } from "@/lib/chat-links";
import {
  getEntryById,
  knowledgeBase,
} from "@/lib/knowledge-base";

type Brief = {
  id: string;
  label: string;
  body: string;
};

function fromEntry(id: number, label?: string): Brief {
  const entry = getEntryById(id);
  if (!entry) {
    return {
      id: "missing",
      label: label || "Ask Me",
      body: "That detail has not been confirmed in the knowledge base yet.",
    };
  }
  return {
    id: `kb-${entry.id}`,
    label: label || entry.question,
    body: enrichAnswerLinks(entry.answer),
  };
}

const topics: Brief[] = [
  fromEntry(1, "Who is Rohit?"),
  fromEntry(2, "What does he do now?"),
  fromEntry(30, "Standout achievements"),
  fromEntry(11, "Core strengths"),
  fromEntry(191, "How to reach him"),
];

function linkProps(href: string) {
  const safe = safeHref(href);
  if (!safe) return null;
  const external = /^https?:\/\//i.test(safe);
  return {
    href: safe,
    ...(external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {}),
  };
}

function BriefBody({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern =
    /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\+\d[\d\s-]{8,}\d)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    if (match[1] && match[2]) {
      const props = linkProps(match[2]);
      nodes.push(props ? (
        <a key={key++} className="hero-signal-brief-link" {...props}>
          {match[1]}
        </a>
      ) : match[1]);
    } else if (match[3]) {
      const href = match[3].replace(/[.,)]+$/, "");
      const trailing = match[3].slice(href.length);
      const props = linkProps(href);
      if (props) {
        nodes.push(
          <a key={key++} className="hero-signal-brief-link" {...props}>
            {href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>,
        );
      } else nodes.push(href);
      if (trailing) nodes.push(trailing);
    } else if (match[4]) {
      nodes.push(
        <a key={key++} className="hero-signal-brief-link" href={`mailto:${match[4]}`}>
          {match[4]}
        </a>,
      );
    } else if (match[5]) {
      const label = match[5];
      const digits = label.replace(/\D/g, "");
      const href = digits === "918130464346" ? `https://wa.me/${digits}` : `tel:+${digits}`;
      nodes.push(
        <a key={key++} className="hero-signal-brief-link" {...linkProps(href)}>
          {label}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return <p className="hero-signal-brief-body">{nodes}</p>;
}

const STORAGE_KEY = "meetrohit.ask.v1";

function readStoredSession(): ChatSession {
  try {
    const tab = sessionStorage.getItem(STORAGE_KEY);
    if (tab) {
      const parsed = parseSession(JSON.parse(tab));
      if (parsed) return parsed;
    }
    const local = localStorage.getItem(STORAGE_KEY);
    if (!local) return emptySession();
    const parsed = parseSession(JSON.parse(local)) ?? emptySession();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  } catch {
    return emptySession();
  }
}

function writeStoredSession(session: ChatSession) {
  const raw = JSON.stringify(session);
  try {
    sessionStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // The in-memory session still covers this visit.
  }
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Private mode or a full quota still leaves the current visit in memory.
  }
}

async function requestAnswer(session: ChatSession, question: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildChatRequest(session, question)),
  });
  if (!response.ok) throw new Error("chat");
  const data = parseChatResponse(await response.json(), session.id);
  if (!data) throw new Error("chat");
  return data;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<ChatSession>(() => emptySession());
  const [query, setQuery] = useState("");
  const threadEnd = useRef<HTMLDivElement>(null);
  const sessionRef = useRef(session);
  const pending = useRef(false);
  const queue = useRef<string[]>([]);

  useEffect(() => {
    const stored = readStoredSession();
    sessionRef.current = stored;
    setSession(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStoredSession(session);
  }, [ready, session]);

  useEffect(() => {
    if (!open) return;
    threadEnd.current?.scrollIntoView({ block: "nearest" });
  }, [open, session.turns.length]);

  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    queue.current.push(trimmed);
    setQuery("");
    if (pending.current) return;
    pending.current = true;

    void (async () => {
      try {
        while (queue.current.length) {
          const question = queue.current.shift();
          if (!question) continue;
          const current = sessionRef.current;
          let label: string;
          let body: string;
          let entryId: number | null;
          let topic: string | null;
          let section: string | null;
          let intent: string | null;
          let entity: string | null;
          try {
            const data = await requestAnswer(current, question);
            label = data.label;
            body = enrichAnswerLinks(data.answer);
            entryId = data.entryId;
            topic = data.topic;
            section = data.section;
            intent = data.intent;
            entity = data.entity;
          } catch {
            const local = resolveAnswer(question, current);
            label = local.label;
            body = enrichAnswerLinks(local.body);
            entryId = local.entryId;
            topic = local.topic;
            section = local.section;
            intent = local.intent;
            entity = local.entity;
          }
          if (sessionRef.current.id !== current.id) continue;
          const next = applyServerTurn(sessionRef.current, question, label, body, { entryId, topic, section, intent, entity });
          sessionRef.current = next;
          setSession(next);
        }
      } finally {
        pending.current = false;
      }
    })();
  }

  function clearChat() {
    const fresh = emptySession();
    queue.current = [];
    sessionRef.current = fresh;
    setSession(fresh);
    writeStoredSession(fresh);
    setQuery("");
  }

  const latestId = session.turns.at(-1)?.entryId;

  return (
    <div className={`hero-signal ${open ? "is-open" : ""}`}>
      {open ? (
        <div className="hero-signal-panel" role="dialog" aria-label="Ask Me about Rohit">
          <div className="hero-signal-glow" aria-hidden="true" />

          <header className="hero-signal-header">
            <div className="hero-signal-brand">
              <span className="hero-signal-dot" aria-hidden="true" />
              <div>
                <p className="hero-signal-kicker">About Rohit</p>
                <p className="hero-signal-title">Ask Me</p>
              </div>
            </div>
            <div className="hero-signal-actions">
              {session.turns.length > 0 ? (
                <button type="button" className="hero-signal-close" onClick={clearChat}>
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                className="hero-signal-close"
                aria-label="Close Ask Me"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </header>

          <div className="hero-signal-body">
            <p className="hero-signal-prompt">Ask anything about Rohit.</p>

            <ul className="hero-signal-lanes">
              {topics.map((topic, index) => (
                <li key={topic.id}>
                  <button
                    type="button"
                    className={`hero-signal-lane ${latestId != null && topic.id === `kb-${latestId}` ? "is-active" : ""}`}
                    onClick={() => ask(topic.label)}
                  >
                    <span className="hero-signal-lane-num">0{index + 1}</span>
                    <span className="hero-signal-lane-label">{topic.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            {session.turns.length > 0 ? (
              <div className="hero-signal-thread">
                {session.turns.map((turn, index) => (
                  <div key={`${session.id}-${index}`} className="hero-signal-brief is-visible">
                    <p className="hero-signal-turn-q">{turn.question}</p>
                    <p className="hero-signal-brief-label">{turn.label}</p>
                    <BriefBody text={turn.answer} />
                  </div>
                ))}
                <div ref={threadEnd} />
              </div>
            ) : (
              <div className="hero-signal-brief">
                <p className="hero-signal-brief-body hero-signal-brief-body--idle">
                  {knowledgeBase.totalQuestions} verified answers ready — work, projects, education, personal profile, and more.
                </p>
              </div>
            )}
          </div>

          <form
            className="hero-signal-form"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              ask(query);
            }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask me anything…"
              aria-label="Ask Me"
              autoComplete="off"
            />
            <button type="submit" aria-label="Ask">
              <span aria-hidden="true">↗</span>
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className="hero-signal-toggle"
        aria-expanded={open}
        aria-label={open ? "Close Ask Me" : "Open Ask Me"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="hero-signal-ring" aria-hidden="true" />
        <span className="hero-signal-ring hero-signal-ring--delay" aria-hidden="true" />
        <span className="hero-signal-core" aria-hidden="true">
          {open ? "×" : "◎"}
        </span>
        <span className="hero-signal-toggle-label">{open ? "Close" : "Ask Me"}</span>
      </button>
    </div>
  );
}
