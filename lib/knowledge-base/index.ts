import knowledgeBaseV1 from "./v1.0.json";
import { portfolioSupplements } from "./supplements";

export type KnowledgeEntry = {
  id: number;
  section: string;
  question: string;
  answer: string;
  keywords: string[];
};

export type KnowledgeBase = {
  version: string;
  title: string;
  edition: string;
  profile: string;
  status: string;
  totalQuestions: number;
  profileFacts: {
    fullName: string;
    dob: string;
    ageAsOf: string;
    hometown: string;
    bornIn: string;
    grewUpIn: string;
    livesIn: string;
    nationality: string;
    languages: string[];
    experienceYears: string;
    title: string;
    company: string;
    studio: string;
    studioUrl: string;
    website: string;
    email: string;
    phones: string[];
    whatsapp: string;
    linkedin: string;
    github: string;
    careerGoal: string;
    teamSizeManaged: number;
    education: { mtech: string; btech: string };
  };
  rules: string[];
  entries: KnowledgeEntry[];
};

/** Active knowledge base — bump this when shipping a new version. */
export const KNOWLEDGE_BASE_VERSION = "1.0";

export const knowledgeBase = knowledgeBaseV1 as KnowledgeBase;

const searchableEntries: KnowledgeEntry[] = [...knowledgeBase.entries, ...portfolioSupplements];

const STOP = new Set(
  "a an the is are was were be been to of in on for with and or what who how which where when does do did has have had can will would should about me my your you he his him please tell from that this into".split(
    " ",
  ),
);

const PRIVATE_ANSWER =
  "Private financial, health, family, and home-address details are not shared. For professional contact, use https://meetrohit.in/, https://www.linkedin.com/in/rohit-gusain-4aa831142/, or jhurohit@gmail.com.";

export type KnowledgeMatch = {
  entry: KnowledgeEntry;
  score: number;
};

export type MatchOptions = {
  minScore?: number;
  previousSection?: string | null;
  excludeIds?: number[];
  /** Keep follow-up answers inside the topic already being discussed. */
  stickToSection?: boolean;
};

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/m\.?\s*tech/g, "mtech")
    .replace(/b\.?\s*tech/g, "btech")
    .replace(/power\s*bi/g, "powerbi")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => (token.length > 4 && token.endsWith("s") && !token.endsWith("ss") ? token.slice(0, -1) : token))
    .filter((token) => token.length > 1 && !STOP.has(token));
}

function keywordTokens(entry: KnowledgeEntry): Set<string> {
  return new Set(entry.keywords.flatMap((keyword) => tokenize(keyword)));
}

const documentFrequency = new Map<string, number>();
for (const entry of searchableEntries) {
  const seen = new Set<string>([...tokenize(entry.question), ...keywordTokens(entry)]);
  for (const token of seen) documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
}

function idf(token: string): number {
  return Math.log((searchableEntries.length + 1) / ((documentFrequency.get(token) ?? 0) + 0.5));
}

function ageAsOf(date = new Date()): number {
  let age = date.getFullYear() - 1996;
  const beforeBirthday = date.getMonth() < 9 || (date.getMonth() === 9 && date.getDate() < 28);
  if (beforeBirthday) age -= 1;
  return age;
}

function present(entry: KnowledgeEntry): KnowledgeEntry {
  if (entry.id !== 202) return entry;
  return {
    ...entry,
    answer: `Rohit was born on 28 October 1996. He is currently ${ageAsOf()} years old.`,
  };
}

function byId(id: number): KnowledgeEntry | undefined {
  return searchableEntries.find((entry) => entry.id === id);
}

function direct(id: number, score = 100): KnowledgeMatch | null {
  const entry = byId(id);
  return entry ? { entry: present(entry), score } : null;
}

function isPrivate(query: string): boolean {
  if (/\b(salary|ctc|compensation|paycheck|wife|married|girlfriend|boyfriend|parents|father|home address|residential address|illness|disease)\b/i.test(query)) {
    return true;
  }
  return /\bfamily\b/i.test(query) && !/\b(language|speak|tongue)\b/i.test(query);
}

/** High-confidence routes for questions the keyword score would confuse. */
function intent(query: string): KnowledgeMatch | null {
  if (isPrivate(query)) {
    return {
      score: 100,
      entry: {
        id: 0,
        section: "Private",
        question: "Private details",
        answer: PRIVATE_ANSWER,
        keywords: [],
      },
    };
  }
  if (/\bshadon\b/i.test(query)) return direct(1005);
  if (/\bfusion\b/i.test(query)) return direct(1006);
  if (/\bwhatsapp\b/i.test(query)) return direct(1002);
  if (/\b(phone|mobile|call me|contact number)\b/i.test(query)) return direct(1001);
  if (/\bgithub\b/i.test(query)) return direct(1003);
  if (/\b(instagram|kaggle|facebook|twitter)\b/i.test(query)) return direct(1004);
  if (/\b(where|place|city)\b/.test(query) && /\bborn\b/.test(query)) return direct(204);
  if (/\b(how old|age|date of birth|d\.?o\.?b\.?|birthday|birth date)\b/.test(query) || /\bwhen\b.*\b(born|birth)\b/.test(query)) {
    return direct(202);
  }
  if (/\b(hometown|home town|uttarakhand|uttrakhand|garhwal|pauri)\b/.test(query) || /\bwhere\b.*\bfrom\b/.test(query)) {
    return direct(203);
  }
  if (/\bwhere\b/.test(query) && /\b(live|living|based)\b/.test(query)) return direct(208);
  if (/\b(speak|spoken|mother tongue|garhwali)\b/.test(query)) return direct(207);
  if (/\bprogramming language/.test(query)) return direct(147);
  if (/\b(who is rohit|who are you|introduce yourself|about rohit|tell me about yourself)\b/.test(query)) return direct(1);
  if (/\b(timeline|employment date|when did)\b/.test(query) || /\b(join|joined)\b/.test(query)) return direct(1007);
  if (
    /\bprojects?\b/.test(query) &&
    !/\b(that|this|the|it)\s+projects?\b/.test(query) &&
    !/\b(swiss|geonexis|fusion|shadon|powerbi|power bi|chatbot|government|hr)\b/.test(query)
  ) {
    return direct(1008);
  }
  if (/\bspringer\b/.test(query)) return direct(178);
  if (
    /\b(research papers?|published papers?|publications?|papers)\b/.test(query) &&
    !/\b(springer|ieee|covid|drowsiness)\b/.test(query)
  ) {
    return direct(176);
  }
  if (/\b(covid|covid-19).*(paper|publication|published|research)\b/.test(query) || /\b(paper|publication).*(covid|covid-19)\b/.test(query)) {
    return direct(176);
  }
  if (/\bproduction rag\b/.test(query) || (/\brag\b/.test(query) && /\b(production|deployed|deploy)\b/.test(query))) return direct(58);
  if (/\brag\b/.test(query) && /\bwhat\b/.test(query)) return direct(56);
  return null;
}

function scoreEntry(queryTokens: string[], entry: KnowledgeEntry, sectionBoost: boolean): number {
  const questionTokens = new Set(tokenize(entry.question));
  const keywords = keywordTokens(entry);
  const answerTokens = new Set(tokenize(entry.answer).slice(0, 48));
  let score = 0;
  let questionHits = 0;

  for (const token of queryTokens) {
    const weight = idf(token);
    if (questionTokens.has(token)) {
      score += 3.6 * weight;
      questionHits += 1;
    } else if (keywords.has(token)) score += 2.4 * weight;
    else if (answerTokens.has(token)) score += 0.9 * weight;
  }

  if (questionHits > 0 && questionTokens.size > 0) {
    score += (questionHits / questionTokens.size) * 1.6;
  }
  if (sectionBoost) score *= 1.3;
  return score;
}

/** Find the best knowledge-base answer for a free-text question. */
export function matchKnowledge(query: string, options: number | MatchOptions = {}): KnowledgeMatch | null {
  const normalized = query.toLowerCase().replace(/\s+/g, " ").trim();
  const minScore = typeof options === "number" ? options : (options.minScore ?? 3.4);
  const previousSection = typeof options === "number" ? null : options.previousSection;
  const excludeIds = typeof options === "number" ? [] : (options.excludeIds ?? []);
  const stickToSection = typeof options === "number" ? false : Boolean(options.stickToSection);

  const routed = intent(normalized);
  if (routed) return routed;

  const queryTokens = [...new Set(tokenize(normalized))];
  if (!queryTokens.length) return null;

  const namesProject = queryTokens.some((token) => ["swiss", "geonexis", "fusion", "shadon", "vlcc", "powerbi"].includes(token));
  const allowBoost = Boolean(previousSection) && !namesProject && (stickToSection || queryTokens.length <= 4);

  let best: KnowledgeMatch | null = null;
  for (const entry of searchableEntries) {
    if (excludeIds.includes(entry.id)) continue;
    if (/\bshadon\b/i.test(`${entry.question} ${entry.answer}`) && !/\bshadon\b/i.test(normalized)) continue;
    const inTopic = allowBoost && entry.section === previousSection;
    const score = scoreEntry(queryTokens, entry, inTopic) * (inTopic && stickToSection ? 1.45 : 1);
    if (!best || score > best.score) best = { entry, score };
  }

  if (!best || best.score < minScore) return null;
  return { ...best, entry: present(best.entry) };
}

export function getEntryById(id: number): KnowledgeEntry | undefined {
  const entry = byId(id);
  return entry ? present(entry) : undefined;
}

/** Next unused answer in the discussion's section, in knowledge-base order. */
export function nextInSection(section: string, excludeIds: number[], topic: string | null): KnowledgeEntry | undefined {
  return searchableEntries.find((entry) => {
    if (entry.section !== section || excludeIds.includes(entry.id)) return false;
    const text = `${entry.question} ${entry.answer}`;
    if (/\bshadon\b/i.test(text) && topic !== "Shadon") return false;
    return true;
  });
}

export function listSections(): string[] {
  return [...new Set(knowledgeBase.entries.map((entry) => entry.section))];
}
