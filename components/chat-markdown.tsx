import { Fragment, ReactNode } from "react";
import { safeHref } from "@/lib/chat-links";

function linkProps(href: string) {
  const safe = safeHref(href);
  if (!safe) return null;
  const external = /^https?:\/\//i.test(safe);
  return {
    href: safe,
    ...(external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {}),
  };
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\+\d[\d\s-]{8,}\d))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const id = `${keyBase}-${key++}`;
    if (match[2]) nodes.push(<strong key={id}>{match[2]}</strong>);
    else if (match[3]) nodes.push(<em key={id}>{match[3]}</em>);
    else if (match[4]) nodes.push(<code key={id}>{match[4]}</code>);
    else if (match[5] && match[6]) {
      const props = linkProps(match[6]);
      nodes.push(props ? <a key={id} className="hero-signal-brief-link" {...props}>{match[5]}</a> : match[5]);
    } else if (match[7]) {
      const href = match[7].replace(/[.,)]+$/, "");
      const trailing = match[7].slice(href.length);
      const props = linkProps(href);
      nodes.push(
        props ? (
          <a key={id} className="hero-signal-brief-link" {...props}>
            {href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        ) : (
          href
        ),
      );
      if (trailing) nodes.push(trailing);
    } else if (match[8]) {
      nodes.push(
        <a key={id} className="hero-signal-brief-link" href={`mailto:${match[8]}`}>
          {match[8]}
        </a>,
      );
    } else if (match[9]) {
      const label = match[9];
      const digits = label.replace(/\D/g, "");
      const whatsapp = /\bwhatsapp\b/i.test(text) && digits === "918130464346";
      const href = whatsapp ? `https://wa.me/${digits}` : `tel:+${digits}`;
      const props = linkProps(href);
      nodes.push(props ? <a key={id} className="hero-signal-brief-link" {...props}>{label}</a> : label);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

type Block =
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] };

function blocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const result: Block[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  function flushParagraph() {
    const value = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (value) result.push({ type: "p", text: value });
    paragraph = [];
  }

  function flushList() {
    if (list && list.items.length) result.push(list);
    list = null;
  }

  for (const raw of lines) {
    const line = raw.trim();
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (ordered || bullet) {
      flushParagraph();
      const type = ordered ? "ol" : "ul";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((ordered ?? bullet)?.[1] ?? line);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return result;
}

export function ChatMarkdown({ text, idle = false }: { text: string; idle?: boolean }) {
  const parts = blocks(text);
  return (
    <div className={`hero-signal-md${idle ? " is-idle" : ""}`}>
      {parts.map((part, index) => {
        if (part.type === "p") {
          return <p key={index}>{renderInline(part.text, `p${index}`)}</p>;
        }
        const Tag = part.type === "ol" ? "ol" : "ul";
        return (
          <Tag key={index}>
            {part.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Fragment>{renderInline(item, `${part.type}${index}-${itemIndex}`)}</Fragment>
              </li>
            ))}
          </Tag>
        );
      })}
    </div>
  );
}
