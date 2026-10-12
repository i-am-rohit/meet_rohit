type Supplement = {
  id: number;
  section: string;
  question: string;
  answer: string;
  keywords: string[];
};

/**
 * Portfolio records that sit alongside the 240 verified answers.
 * Ask Me can use these. They do not change the verified question count.
 */
export const portfolioSupplements: Supplement[] = [
  {
    id: 1001,
    section: "Contact, Portfolio & General",
    question: "What is Rohit's phone number?",
    answer: "You can call +91 81304 64346 or +91 99903 03070.",
    keywords: ["phone", "mobile", "call", "number", "telephone"],
  },
  {
    id: 1002,
    section: "Contact, Portfolio & General",
    question: "What is Rohit's WhatsApp?",
    answer: "WhatsApp Rohit on +91 81304 64346: https://wa.me/918130464346",
    keywords: ["whatsapp", "wa"],
  },
  {
    id: 1003,
    section: "Contact, Portfolio & General",
    question: "What is Rohit's GitHub?",
    answer:
      "GitHub: https://github.com/i-am-rohit. Portfolio repos include Geonexis, the HR chatbot (RASA), the drowsiness project, and the COVID-19 analysis.",
    keywords: ["github", "repository", "repo"],
  },
  {
    id: 1004,
    section: "Contact, Portfolio & General",
    question: "What are Rohit's other social profiles?",
    answer:
      "Instagram: https://www.instagram.com/predictive_engineer/ — Kaggle: https://www.kaggle.com/rohitgusain — Facebook: https://www.facebook.com/gusain0001 — X: https://twitter.com/RohitGusain0001",
    keywords: ["instagram", "kaggle", "facebook", "twitter", "social"],
  },
  {
    id: 1005,
    section: "Professional Experience",
    question: "What is Shadon?",
    answer:
      "Shadon is a personal prototype of a private local assistant for voice and text, with retrieval and memory. It is personal R&D, not a verified production RAG or agent system. The portfolio lists Ollama, Qwen, Phi, Faster-Whisper, and FAISS. Repository: https://github.com/i-am-rohit/SHADON-AI",
    keywords: ["shadon"],
  },
  {
    id: 1006,
    section: "Professional Experience",
    question: "What is FUSION?",
    answer:
      "FUSION is a document utility on the portfolio, currently in development. It is aimed at OCR, summarisation, and search across mixed files. Production RAG deployment has not been verified.",
    keywords: ["fusion", "document utility"],
  },
  {
    id: 1007,
    section: "Professional Experience",
    question: "What are the dates of Rohit's roles?",
    answer:
      "VLCC Healthcare Limited, Programme Manager – AI & Digital Transformation, June 2025 to present. SISL Infotech, Data Analyst, January 2025 to May 2025. GlobalLogic Technologies, Senior Analyst, August 2020 to February 2024. Prakhar Software Solutions, Software Engineer – AI / NLP, June 2019 to March 2020.",
    keywords: ["dates", "timeline", "joined", "senior analyst", "june 2025", "employment history"],
  },
  {
    id: 1008,
    section: "Professional Experience",
    question: "What projects are on Rohit's portfolio?",
    answer:
      "The principal programmes are SWISS, Geonexis, and 25 enterprise Power BI dashboards. He has also worked on government document intelligence, government scheme forecasting, an HR chatbot, an IEEE driver-drowsiness paper, and a Springer COVID-19 machine learning chapter. FUSION, a document utility, is in development. Production RAG is not verified.",
    keywords: ["projects", "portfolio projects", "case studies", "built"],
  },
];
