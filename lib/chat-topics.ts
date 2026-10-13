import { certificates } from "@/lib/content";
import { knowledgeBase } from "@/lib/knowledge-base";

const facts = knowledgeBase.profileFacts;

export type TopicRecord = {
  id: string;
  category: string;
  intent: string;
  question: string;
  answer: string;
  aliases: string[];
  relatedIntents: string[];
  source: string;
  entryId: number;
  entity: string;
};

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function phoneAnswer(): string {
  const links = facts.phones.map((phone) => `[${phone}](tel:+${phoneDigits(phone)})`);
  if (links.length < 2) return `Call Rohit at ${links[0] ?? ""}.`;
  return `Call Rohit at ${links.slice(0, -1).join(", ")} or ${links[links.length - 1]}.`;
}

function whatsappAnswer(): string {
  const phone = facts.whatsapp;
  return `Message Rohit on WhatsApp at [${phone}](https://wa.me/${phoneDigits(phone)}).`;
}

function namedIssuer(issuer: string): boolean {
  return !/^(training programme|internship programme)$/i.test(issuer.trim());
}

/** Verified portfolio certificates. Missing issuers and dates stay missing. */
export function certificationAnswer(): string {
  const lines = certificates.map((item, index) => {
    const date = "issueDate" in item && item.issueDate ? item.issueDate : "";
    const issuer = namedIssuer(item.issuer) ? item.issuer : "";
    let detail = "listed on the portfolio. Issuing organization and completion date are not recorded";
    if (issuer && date) detail = `${issuer}, ${date}`;
    else if (issuer) detail = `${issuer}. Completion date is not recorded`;
    else if (date) detail = `${date}. Issuing organization is not recorded`;
    const credential = "credentialUrl" in item && item.credentialUrl ? ` ([credential](${item.credentialUrl}))` : "";
    return `${index + 1}. **${item.name}** — ${detail}${credential}`;
  });
  return `Certificates listed on Rohit's portfolio:\n\n${lines.join("\n")}`;
}

const BTECH_ANSWER =
  "He completed his B.Tech in Electronics and Communication from Jamia Hamdard in 2019 with 70%.";

export const topicRecords: TopicRecord[] = [
  {
    id: "btech",
    category: "education",
    intent: "education",
    question: "What is Rohit's bachelor's degree?",
    answer: BTECH_ANSWER,
    aliases: [
      "bachelor",
      "bachelors",
      "bachelros",
      "bachelors degree",
      "undergraduate",
      "undergraduate degree",
      "graduation",
      "b tech",
      "btech",
      "ug qualification",
      "ug",
      "college degree",
    ],
    relatedIntents: ["education"],
    source: "Verified portfolio education record",
    entryId: 175,
    entity: "B.Tech",
  },
  {
    id: "certifications",
    category: "certifications",
    intent: "certifications",
    question: "What certifications does Rohit have?",
    answer: certificationAnswer(),
    aliases: [
      "certificate",
      "certificates",
      "certification",
      "certifications",
      "courses",
      "training",
      "credentials",
      "credential",
    ],
    relatedIntents: ["education"],
    source: "Portfolio certificate records and knowledge-base entry 179",
    entryId: 179,
    entity: "certificates",
  },
  {
    id: "phone",
    category: "contact",
    intent: "phone",
    question: "What is Rohit's mobile number?",
    answer: phoneAnswer(),
    aliases: ["phone", "mobile", "mobile number", "phone number", "contact number", "cell"],
    relatedIntents: ["contact", "whatsapp"],
    source: "Verified profile contact records",
    entryId: 1001,
    entity: "Rohit",
  },
  {
    id: "whatsapp",
    category: "contact",
    intent: "whatsapp",
    question: "What is Rohit's WhatsApp?",
    answer: whatsappAnswer(),
    aliases: ["whatsapp", "whats app"],
    relatedIntents: ["contact", "phone"],
    source: "Verified profile contact records",
    entryId: 1002,
    entity: "Rohit",
  },
];

export function topicById(id: string): TopicRecord | undefined {
  return topicRecords.find((record) => record.id === id);
}

/** True when the normalized question contains one alias as whole words. */
export function aliasHit(id: string, normalized: string): boolean {
  const record = topicById(id);
  if (!record) return false;
  return record.aliases.some((alias) => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
    return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(normalized);
  });
}
