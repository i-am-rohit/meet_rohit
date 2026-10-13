"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { applyServerTurn, emptySession, parseSession, type ChatSession } from "@/lib/chat-memory";
import { resolveAnswer } from "@/lib/chat-answer";
import { buildChatRequest, parseChatResponse } from "@/lib/chat-request";
import { enrichAnswerLinks } from "@/lib/chat-links";
import { getEntryById } from "@/lib/knowledge-base";
import { ChatMarkdown } from "@/components/chat-markdown";

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
  fromEntry(176, "Research papers"),
  fromEntry(11, "Core strengths"),
  fromEntry(191, "How to reach him"),
];

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
  const [mobile, setMobile] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const stickToBottom = useRef(true);
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
    const media = window.matchMedia("(max-width: 767.98px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open || !mobile) return;
    const y = window.scrollY;
    const body = document.body;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(0, y);
    };
  }, [open, mobile]);

  useEffect(() => {
    if (!open || !mobile) return;
    const root = document.documentElement;
    const apply = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;
      root.style.setProperty("--chat-height", `${viewport.height}px`);
      root.style.setProperty("--chat-top", `${viewport.offsetTop}px`);
    };
    apply();
    window.visualViewport?.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("scroll", apply);
    return () => {
      window.visualViewport?.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("scroll", apply);
      root.style.removeProperty("--chat-height");
      root.style.removeProperty("--chat-top");
    };
  }, [open, mobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!open || !el || !stickToBottom.current) return;
    el.scrollTop = el.scrollHeight;
  }, [open, session.turns.length]);

  function closeChat() {
    setOpen(false);
    toggleRef.current?.focus();
  }

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

  const panel = open ? (
        <div
          className={`hero-signal-panel${mobile ? " is-fullscreen" : ""}`}
          role="dialog"
          aria-modal={mobile ? true : undefined}
          aria-label="Ask Me about Rohit"
        >
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
                onClick={closeChat}
              >
                Close
              </button>
            </div>
          </header>

          <div
            className="hero-signal-body"
            ref={bodyRef}
            onScroll={() => {
              const el = bodyRef.current;
              if (!el) return;
              stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            }}
          >
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
                  <div key={`${session.id}-${index}`} className="hero-signal-turn">
                    <p className="hero-signal-user">{turn.question}</p>
                    <div className="hero-signal-assistant">
                      <ChatMarkdown text={turn.answer} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="hero-signal-assistant is-idle">
                <ChatMarkdown idle text="Hi! I'm Rohit's AI assistant. Ask about his work, projects, education, or how to reach him." />
              </div>
            )}
          </div>

          <form
            className="hero-signal-form"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              stickToBottom.current = true;
              ask(query);
            }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask me anything…"
              aria-label="Ask Me"
              autoComplete="off"
              enterKeyHint="send"
            />
            <button type="submit" aria-label="Ask">
              <span aria-hidden="true">↗</span>
            </button>
          </form>
        </div>
  ) : null;

  return (
    <div className={`hero-signal ${open ? "is-open" : ""}`}>
      {panel && mobile && typeof document !== "undefined" ? createPortal(panel, document.body) : panel}

      <button
        ref={toggleRef}
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
