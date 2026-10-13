import { knowledgeBase } from "@/lib/knowledge-base";

const facts = knowledgeBase.profileFacts;
const siteOrigin = facts.website.replace(/\/$/, "");

/** Public resume file in `public/resume`. Built from the site URL so answers never use localhost. */
export const publicResumeUrl = `${siteOrigin}/resume/Rohit%20Gusain.pdf`;

function resumeHref(value: string): string | null {
  const local = value.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/.*)$/i);
  const path = local?.[1] ?? value;
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    decoded = path;
  }
  if (/^\/resume\/Rohit Gusain\.pdf$/i.test(decoded)) return publicResumeUrl;
  return null;
}

/** Accept only real absolute or site-root links. Never leave a bare domain for the browser to resolve against localhost. */
export function safeHref(href: string): string | null {
  const value = href.trim().replace(/[.,)]+$/, "");
  if (!value || /\s/.test(value) || value.startsWith("//")) return null;
  const resume = resumeHref(value);
  if (resume) return resume;
  if (/^https?:\/\//i.test(value)) {
    if (/^https?:\/\/meetrohit\.in$/i.test(value)) return "https://meetrohit.in/";
    return value;
  }
  if (/^(mailto|tel):/i.test(value)) return value;
  if (value.startsWith("/")) return value;
  if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#][^\s]*)?$/i.test(value)) {
    const absolute = `https://${value}`;
    return /^https:\/\/meetrohit\.in$/i.test(absolute) ? "https://meetrohit.in/" : absolute;
  }
  return null;
}

function markdown(label: string, href: string): string {
  const safe = safeHref(href);
  return safe ? `[${label}](${safe})` : label;
}

/** Turn known contact details into Markdown links without nesting links that are already formatted. */
export function enrichAnswerLinks(answer: string): string {
  return answer
    .split(/(\[[^\]]+\]\([^)]+\))/g)
    .map((part) => {
      if (part.startsWith("[")) {
        return part.replace(/\[([^\]]+)\]\(([^)]+)\)/, (_full, label: string, href: string) => markdown(label, href));
      }
      return part
        .replace(/https:\/\/meetrohit\.in\/?/g, markdown("meetrohit.in", facts.website))
        .replace(/https:\/\/www\.linkedin\.com\/in\/rohit-gusain-4aa831142\/?/g, markdown("LinkedIn", facts.linkedin))
        .replace(/jhurohit@gmail\.com/g, markdown(facts.email, `mailto:${facts.email}`))
        .replace(/Engineering Thing AI/g, markdown(facts.studio, facts.studioUrl));
    })
    .join("");
}
