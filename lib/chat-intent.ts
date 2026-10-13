import type { ChatSession } from "@/lib/chat-memory";
import { aliasHit, topicById } from "@/lib/chat-topics";

export type IntentId =
  | "greeting"
  | "hometown"
  | "current_location"
  | "total_experience"
  | "employment_history"
  | "technical_skills"
  | "contact"
  | "education"
  | "achievements"
  | "current_role"
  | "projects"
  | "certifications"
  | "phone"
  | "whatsapp";

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
  bachelros: "bachelors",
  bachlors: "bachelors",
  bachelr: "bachelor",
  bachler: "bachelor",
  bachelo: "bachelor",
  undergratuate: "undergraduate",
  undergradute: "undergraduate",
  certifcates: "certificates",
  certifcate: "certificate",
  certificaton: "certification",
  certificats: "certificates",
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
    label: "",
    answer:
      "You can reach Rohit at [meetrohit.in](https://meetrohit.in/), [LinkedIn](https://www.linkedin.com/in/rohit-gusain-4aa831142/), or [jhurohit@gmail.com](mailto:jhurohit@gmail.com).",
    topic: "contact",
    section: "Contact, Portfolio & General",
    entity: "Rohit",
  },
  education: {
    entryId: 4,
    label: "",
    answer:
      "Rohit holds an **M.Tech in Artificial Intelligence** from NIET, Greater Noida, completed in 2022 with 84%.\n\nHe also holds a **B.Tech in Electronics and Communication** from Jamia Hamdard, completed in 2019 with 70%.",
    topic: "education",
    section: "Education, Research & Certifications",
    entity: "both",
  },
  achievements: {
    entryId: 30,
    label: "",
    answer:
      "Rohit's major professional achievements include:\n\n1. **SWISS:** AI-powered video analytics deployed across 175+ VLCC locations.\n2. **Geonexis:** AI-enabled field workforce management platform.\n3. **Power BI:** Independently developed 25 enterprise dashboards.",
    topic: "achievements",
    section: "Professional Experience",
    entity: "SWISS",
  },
  current_role: {
    entryId: 2,
    label: "",
    answer:
      "Rohit currently works as **Programme Manager – AI & Digital Transformation at VLCC Healthcare Limited**.\n\nHe leads enterprise AI initiatives including SWISS, Geonexis, and Power BI analytics.",
    topic: "current role",
    section: "About Me & Introduction",
    entity: "VLCC Healthcare",
  },
  projects: {
    entryId: 19,
    label: "",
    answer:
      "Rohit's confirmed projects include SWISS, Geonexis, and enterprise Power BI dashboards, plus government document intelligence and an HR chatbot.",
    topic: "projects",
    section: "Professional Experience",
    entity: "SWISS",
  },
  certifications: {
    entryId: 179,
    label: "",
    answer: topicById("certifications")?.answer ?? "",
    topic: "certifications",
    section: "Education, Research & Certifications",
    entity: "certificates",
  },
  phone: {
    entryId: 1001,
    label: "",
    answer: topicById("phone")?.answer ?? "",
    topic: "contact",
    section: "Contact, Portfolio & General",
    entity: "Rohit",
  },
  whatsapp: {
    entryId: 1002,
    label: "",
    answer: topicById("whatsapp")?.answer ?? "",
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

function pack(intent: IntentId, confidence: number, answer?: string, entryId?: number, entity?: string): ClassifiedIntent {
  const item = INTENTS[intent];
  return {
    intent,
    confidence,
    ...item,
    label: "",
    answer: answer ?? item.answer,
    entryId: entryId ?? item.entryId,
    entity: entity ?? item.entity,
  };
}

const EXACT: Record<string, IntentId> = {
  education: "education",
  "educational background": "education",
  qualification: "education",
  qualifications: "education",
  achievements: "achievements",
  achievement: "achievements",
  experience: "total_experience",
  "work experience": "total_experience",
  "current job": "current_role",
  "current role": "current_role",
  "what does he do now": "current_role",
  "what does he do": "current_role",
  "what does rohit do now": "current_role",
  "what does rohit do": "current_role",
  "what are his achievements": "achievements",
  "tell me about his achievements": "achievements",
  "how can i contact him": "contact",
  "where is he from": "hometown",
  "where is he working": "current_role",
  "where does he work": "current_role",
  companies: "employment_history",
  company: "employment_history",
  skills: "technical_skills",
  skill: "technical_skills",
  "core strengths": "technical_skills",
  "core strength": "technical_skills",
  projects: "projects",
  project: "projects",
  contact: "contact",
  "how to reach him": "contact",
  "how to reach you": "contact",
  certificates: "certifications",
  certificate: "certifications",
  certification: "certifications",
  certifications: "certifications",
  courses: "certifications",
  training: "certifications",
  credentials: "certifications",
  credential: "certifications",
  whatsapp: "whatsapp",
  "whats app": "whatsapp",
  phone: "phone",
  mobile: "phone",
  "mobile number": "phone",
  "phone number": "phone",
  "contact number": "phone",
};

const NUDGE_SUBJECT: Record<string, string> = {
  education: "Rohit's education",
  experience: "Rohit's experience",
  companies: "the companies Rohit has worked for",
  skills: "Rohit's skills",
  achievements: "Rohit's achievements",
  "current role": "Rohit's current role",
  projects: "Rohit's projects",
  contact: "how to reach Rohit",
  certifications: "Rohit's certifications",
  hometown: "Rohit's hometown",
  "current location": "where Rohit lives",
  Geonexis: "Geonexis",
  SWISS: "SWISS",
  "Power BI": "Power BI",
  "HR chatbot": "the HR chatbot",
};

function nudge(session: ChatSession): ClassifiedIntent {
  const known = session.intent && session.intent in INTENTS ? (session.intent as IntentId) : "greeting";
  const item = INTENTS[known];
  const topic = session.topic ?? item.topic;
  const subject = NUDGE_SUBJECT[topic];
  return {
    intent: known,
    confidence: 0.86,
    entryId: item.entryId,
    label: "",
    answer: subject ? `Would you like to know more about ${subject}?` : "What would you like to know about Rohit?",
    topic,
    section: session.section ?? item.section,
    entity: session.entity ?? item.entity,
  };
}

function onEducation(session: ChatSession): boolean {
  return session.intent === "education" || session.topic === "education";
}

const MTECH_ANSWER =
  "Rohit holds an **M.Tech in Artificial Intelligence** from NIET, Greater Noida, completed in 2022 with 84%.";
const BTECH_ANSWER =
  topicById("btech")?.answer ??
  "He completed his B.Tech in Electronics and Communication from Jamia Hamdard in 2019 with 70%.";

function asksMaster(q: string): boolean {
  return /\b(masters?|m\s*tech|mtech|m\s*rech|mrech|post\s*grad\w*)\b/.test(q);
}

function asksBachelor(q: string): boolean {
  if (/\bpost\s*grad/.test(q)) return false;
  return aliasHit("btech", q) || /\b(bachelors?|b\s*tech|btech|under\s*grad\w*)\b/.test(q);
}

function educationDetail(q: string, session: ChatSession): ClassifiedIntent | null {
  const master = asksMaster(q);
  const bachelor = asksBachelor(q);
  if (master && !bachelor) return pack("education", 0.98, MTECH_ANSWER, 4, "M.Tech");
  if (bachelor && !master) return pack("education", 0.98, BTECH_ANSWER, 175, "B.Tech");

  const focus = session.entity;
  if (/\b(college|university|institute)\b/.test(q)) {
    const universityOnly = /\buniversity\b/.test(q) && !/\b(college|institute)\b/.test(q);
    if (focus === "B.Tech") {
      return pack("education", 0.97, universityOnly ? "Jamia Hamdard." : "He completed his B.Tech at Jamia Hamdard.", 175, "B.Tech");
    }
    if (focus === "M.Tech") {
      return pack("education", 0.97, universityOnly ? "NIET, Greater Noida." : "He completed his M.Tech at NIET, Greater Noida.", 172, "M.Tech");
    }
    return pack(
      "education",
      0.97,
      "He completed his M.Tech at NIET, Greater Noida, and his B.Tech at Jamia Hamdard.",
      4,
      "both",
    );
  }
  if (onEducation(session) && /\b(percentage|percent|marks|scored|score)\b/.test(q)) {
    if (focus === "B.Tech") return pack("education", 0.97, "He scored 70% in his B.Tech.", 175, "B.Tech");
    if (focus === "M.Tech") return pack("education", 0.97, "He scored 84% in his M.Tech.", 174, "M.Tech");
    return pack("education", 0.97, "He scored 84% in his M.Tech and 70% in his B.Tech.", 174, "both");
  }
  if (onEducation(session) && /^(when|what year|which year)$/.test(q)) {
    if (focus === "B.Tech") return pack("education", 0.92, "He completed his B.Tech in 2019.", 175, "B.Tech");
    if (focus === "M.Tech") return pack("education", 0.92, "He completed his M.Tech in 2022.", 173, "M.Tech");
    return pack("education", 0.92, "He completed his M.Tech in 2022 and his B.Tech in 2019.", 4, "both");
  }
  return null;
}

function directIntent(q: string): ClassifiedIntent | null {
  if (EXACT[q]) return pack(EXACT[q], 0.99);
  if (aliasHit("whatsapp", q)) return pack("whatsapp", 0.98);
  if (aliasHit("phone", q)) return pack("phone", 0.97);
  if (aliasHit("certifications", q) && !/\b(model|dataset|neural|yolo|llm)\b/.test(q)) return pack("certifications", 0.96);
  const stay = /\b(put up|putting up|staying|lives|living|live|based|reside|residing|settled)\b/.test(q);
  const origin = /\b(hometown|home town|native|belong|originally|from)\b/.test(q);
  if (stay && !/\bfrom\b/.test(q)) return pack("current_location", 0.96);
  if (origin && /\b(where|hometown|native|belong|originally)\b/.test(q)) return pack("hometown", 0.96);
  if (
    /\b(current job|current role|currently works?|what does (?:he|rohit) do|where is he working|where does he work|where are you working)\b/.test(q)
  ) {
    return pack("current_role", 0.96);
  }
  if (/\b(compan(?:y|ies)|organi[sz]ations?|employers?)\b/.test(q) || /\bwhere\b.*\b(worked|companies)\b/.test(q)) {
    return pack("employment_history", 0.95);
  }
  if (PROJECT.test(q)) return null;
  if (/\bachievements?\b/.test(q)) return pack("achievements", 0.95);
  if (/\b(education|educational|qualification|qualifications|degree)\b/.test(q)) return pack("education", 0.95);
  if (/\b(how to reach|how can i contact|reach him|reach you|get in touch|contact him|contact you|contact rohit|^contact$)\b/.test(q)) {
    return pack("contact", 0.96);
  }
  if (/^(projects?)$/.test(q) || (/\bprojects?\b/.test(q) && !PROJECT.test(q) && q.split(" ").length <= 4)) {
    return pack("projects", 0.94);
  }
  if (/\b(core strengths?|strengths|tech stack|technologies|technology|tools used|skill set|skills?)\b/.test(q)) {
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
  const raw = question.trim();
  if (/^[?\s.!]+$/.test(raw)) return nudge(session);

  const q = normalizeQuestion(question);
  if (!q) return nudge(session);
  const projectTopic = session.topic && /^(Geonexis|SWISS|FUSION|Shadon|Power BI|HR chatbot)$/.test(session.topic);
  if (projectTopic && /\b(technolog\w*|stack|tools|tell me more|explain this|explain that|explain)\b/.test(q) && !/\b(compan\w*|hometown|put up|experience|education)\b/.test(q)) {
    return null;
  }
  return educationDetail(q, session) ?? directIntent(q) ?? followUpIntent(q, session);
}
