import type { ChatSession } from "@/lib/chat-memory";

export type IntentId =
  | "greeting"
  | "hometown"
  | "current_location"
  | "total_experience"
  | "employment_history"
  | "technical_skills"
  | "contact";

export type ClassifiedIntent = {
  intent: IntentId;
  confidence: number;
  entryId: number;
  label: string;
  answer: string;
  topic: string;
  section: string;
  entity: string;
};

const CANONICAL = [
  "which",
  "companies",
  "company",
  "experience",
  "hometown",
  "technologies",
  "technology",
  "originally",
  "uttarakhand",
  "garhwal",
  "organizations",
  "organisation",
  "employers",
  "staying",
  "living",
  "skills",
  "explain",
];

const TYPOS: Record<string, string> = {
  whcih: "which",
  wich: "which",
  whihc: "which",
  comapnies: "companies",
  compnies: "companies",
  companys: "companies",
  comapny: "company",
  experince: "experience",
  experiance: "experience",
  expereince: "experience",
  expierence: "experience",
  putup: "put up",
  homtown: "hometown",
  hometwon: "hometown",
  uttrakhand: "uttarakhand",
  techologies: "technologies",
  tecnologies: "technologies",
  technolgies: "technologies",
  orginially: "originally",
};

const PROJECT = /\b(swiss|geonexis|fusion|shadon|power\s*bi|powerbi|dax|yolo)\b/;

const INTENTS: Record<
  IntentId,
  { entryId: number; label: string; answer: string; topic: string; section: string; entity: string }
> = {
  greeting: {
    entryId: 0,
    label: "Hello",
    answer: "",
    topic: "greeting",
    section: "About Me & Introduction",
    entity: "Rohit",
  },
  hometown: {
    entryId: 203,
    label: "Hometown",
    answer: "Rohit's hometown is Pauri Garhwal, Uttarakhand, but he was born and raised in Delhi.",
    topic: "hometown",
    section: "Personal Profile",
    entity: "Pauri Garhwal",
  },
  current_location: {
    entryId: 208,
    label: "Current location",
    answer: "He's currently based in Delhi, India.",
    topic: "current location",
    section: "Personal Profile",
    entity: "Delhi",
  },
  total_experience: {
    entryId: 3,
    label: "Experience",
    answer:
      "Rohit has approximately 6 years of experience in AI, Machine Learning, Computer Vision, NLP, and Digital Transformation.",
    topic: "experience",
    section: "About Me & Introduction",
    entity: "Rohit",
  },
  employment_history: {
    entryId: 16,
    label: "Companies",
    answer: "Rohit has worked at VLCC Healthcare, SISL Infotech, GlobalLogic (Google-related projects), and Prakhar Software Solutions.",
    topic: "companies",
    section: "Professional Experience",
    entity: "VLCC Healthcare",
  },
  technical_skills: {
    entryId: 11,
    label: "Skills",
    answer:
      "Rohit's confirmed strengths are AI solution planning, Computer Vision, NLP, ML forecasting, business intelligence, technical integration, and programme management.",
    topic: "skills",
    section: "About Me & Introduction",
    entity: "Rohit",
  },
  contact: {
    entryId: 194,
    label: "Contact",
    answer:
      "You can reach Rohit at [meetrohit.in](https://meetrohit.in/), [LinkedIn](https://www.linkedin.com/in/rohit-gusain-4aa831142/), or [jhurohit@gmail.com](mailto:jhurohit@gmail.com).",
    topic: "contact",
    section: "Contact, Portfolio & General",
    entity: "Rohit",
  },
};

function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[a.length][b.length];
}

function correctToken(token: string): string {
  if (TYPOS[token]) return TYPOS[token];
  if (token.length < 5 || CANONICAL.includes(token)) return token;
  let best = token;
  let bestDistance = token.length >= 8 ? 2 : 1;
  let ties = 0;
  for (const word of CANONICAL) {
    if (Math.abs(word.length - token.length) > bestDistance) continue;
    const distance = editDistance(token, word);
    if (distance === 0) return token;
    if (distance < bestDistance) {
      best = word;
      bestDistance = distance;
      ties = 1;
    } else if (distance === bestDistance && word !== best) {
      ties += 1;
    }
  }
  return ties === 1 ? best : token;
}

/** Lowercase, strip punctuation, and repair common typos before intent matching. */
export function normalizeQuestion(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(correctToken)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function pack(intent: IntentId, confidence: number): ClassifiedIntent {
  const item = INTENTS[intent];
  return { intent, confidence, ...item };
}

function directIntent(q: string): ClassifiedIntent | null {
  const stay = /\b(put up|putting up|staying|lives|living|live|based|reside|residing|settled)\b/.test(q);
  const origin = /\b(hometown|home town|native|belong|originally|from)\b/.test(q);
  if (stay && !/\bfrom\b/.test(q)) return pack("current_location", 0.96);
  if (origin && /\b(where|hometown|native|belong|originally)\b/.test(q)) return pack("hometown", 0.96);
  if (/\b(compan(?:y|ies)|organi[sz]ations?|employers?)\b/.test(q) || /\bwhere\b.*\bwork/.test(q)) {
    return pack("employment_history", 0.95);
  }
  if (PROJECT.test(q)) return null;
  if (/\b(how to reach|reach him|reach you|get in touch|contact him|contact you|contact rohit)\b/.test(q)) {
    return pack("contact", 0.93);
  }
  if (/\b(tech stack|technologies|technology|tools used|skill set|skills)\b/.test(q) && !PROJECT.test(q)) {
    return pack("technical_skills", 0.9);
  }
  if (/\bexp\b/.test(q) || /\b(experience|work ex|years worked|work experience|how many years)\b/.test(q)) {
    return pack("total_experience", 0.94);
  }
  return null;
}

function followUpIntent(q: string, session: ChatSession): ClassifiedIntent | null {
  const last = session.intent;
  if (!last || PROJECT.test(q)) return null;
  const fragment =
    /^(and|where|which|how many|what about that|what about it|explain this|explain that)\b/.test(q) &&
    q.split(" ").length <= 5;
  if (!fragment) return null;
  if ((last === "hometown" || last === "birthplace") && /^(and|where|what about)\b/.test(q)) {
    return pack("current_location", 0.84);
  }
  if (last === "total_experience" && /^(and|which|where|what about|how many)\b/.test(q)) {
    return pack("employment_history", 0.86);
  }
  if (last === "employment_history" && /^(and|what)\b/.test(q) && !session.topic?.match(/Geonexis|SWISS|FUSION|Shadon|Power BI/)) {
    return pack("technical_skills", 0.8);
  }
  return null;
}

/**
 * Classify a question against verified profile intents.
 * A specific meaning in the current question wins over the previous topic.
 */
export function classifyQuestion(question: string, session: ChatSession): ClassifiedIntent | null {
  const q = normalizeQuestion(question);
  if (!q) return null;
  const projectTopic = session.topic && /^(Geonexis|SWISS|FUSION|Shadon|Power BI|HR chatbot)$/.test(session.topic);
  if (projectTopic && /\b(technolog\w*|stack|tools|tell me more|explain this|explain that|explain)\b/.test(q) && !/\b(compan\w*|hometown|put up|experience)\b/.test(q)) {
    return null;
  }
  return directIntent(q) ?? followUpIntent(q, session);
}
