export type ParsedRecord = {
  id: number;
  section: string;
  question: string;
  answer: string;
  keywords: string[];
};

export type ParseReport = {
  records: ParsedRecord[];
  duplicates: number[];
  missing: number[];
  malformed: string[];
};

const QUESTION = /^\*\*Q(\d+)\.\s+(.+?)\*\*\s*$/;
const SECTION = /^## Section \d+\s+[—–-]\s+(.+?)\s+\(\d+\s*[–-]\s*\d+\)\s*$/;

const STOP = new Set(
  "a an the is are was were be been to of in on for with and or what who how which where when does do did has have had can will would should about me my your you he his him she her their from that this into yes no not but".split(
    " ",
  ),
);

function keywordsFor(question: string, answer: string): string[] {
  const tokens = `${question} ${answer}`
    .toLowerCase()
    .replace(/m\.?\s*tech/g, "mtech")
    .replace(/b\.?\s*tech/g, "btech")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP.has(token));
  return [...new Set(tokens)].sort().slice(0, 24);
}

/**
 * Split the verified Markdown knowledge base into one record per question.
 * A section heading ends the previous answer and never becomes part of it.
 */
export function parseKnowledgeMarkdown(markdown: string): ParseReport {
  const records: ParsedRecord[] = [];
  const malformed: string[] = [];
  let section = "";
  let current: { id: number; question: string; lines: string[] } | null = null;

  function flush() {
    if (!current) return;
    const answer = current.lines
      .join("\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (!section) malformed.push(`Q${current.id} has no section`);
    if (!current.question) malformed.push(`Q${current.id} has no question`);
    if (!answer) malformed.push(`Q${current.id} has an empty answer`);
    if (/^##\s+Section\b/m.test(answer) || /\*\*Q\d+\./.test(answer)) {
      malformed.push(`Q${current.id} absorbed the next question or section`);
    }
    records.push({
      id: current.id,
      section,
      question: current.question,
      answer,
      keywords: keywordsFor(current.question, answer),
    });
    current = null;
  }

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "---" || line.startsWith("## Chatbot Knowledge Base Rules")) {
      flush();
      break;
    }
    const sectionMatch = line.match(SECTION);
    if (sectionMatch) {
      flush();
      section = sectionMatch[1].trim();
      continue;
    }
    const questionMatch = line.match(QUESTION);
    if (questionMatch) {
      flush();
      current = { id: Number(questionMatch[1]), question: questionMatch[2].trim(), lines: [] };
      continue;
    }
    if (!current || !line) {
      if (current && !line) current.lines.push("");
      continue;
    }
    current.lines.push(line);
  }
  flush();

  const ids = records.map((record) => record.id);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort((a, b) => a - b);
  const present = new Set(ids);
  const missing: number[] = [];
  for (let id = 1; id <= 240; id += 1) {
    if (!present.has(id)) missing.push(id);
  }
  const extra = ids.filter((id) => id < 1 || id > 240);
  for (const id of extra) malformed.push(`Q${id} is outside 1–240`);

  return {
    records: records.filter((record) => record.id >= 1 && record.id <= 240).sort((a, b) => a.id - b.id),
    duplicates,
    missing,
    malformed,
  };
}
