export const nav = [
  { href: "#top", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#certificates", label: "Certificates" },
] as const;

export const expertise = [
  {
    label: "AI & Machine Learning",
    skills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Scikit-learn",
      "TensorFlow",
      "Keras",
      "PyTorch",
      "XGBoost",
      "Model Development",
      "Model Deployment",
    ],
  },
  {
    label: "Generative & Agentic AI",
    skills: [
      "Generative AI",
      "LLMs",
      "RAG",
      "Agentic AI",
      "LangChain",
      "LangGraph",
      "FAISS",
      "ChromaDB",
      "MCP",
      "Function Calling",
      "GPT",
      "Claude",
      "Gemini",
      "Llama",
    ],
  },
  {
    label: "End-to-End AI Solutions",
    skills: [
      "AI Solution Architecture",
      "Requirement Analysis",
      "Solution Design",
      "API Development",
      "FastAPI",
      "Django",
      "REST APIs",
      "AWS",
      "SageMaker",
      "Bedrock",
      "EC2",
      "S3",
      "System Integration",
      "Deployment",
    ],
  },
  {
    label: "Computer Vision & NLP",
    skills: [
      "YOLOv8",
      "DeepSORT",
      "OpenCV",
      "Object Detection",
      "Object Tracking",
      "Video Analytics",
      "Rasa",
      "spaCy",
      "Conversational AI",
      "Text Processing",
      "NLP",
    ],
  },
  {
    label: "Predictive Analytics & Decision Intelligence",
    skills: [
      "Predictive Analytics",
      "Time-Series Forecasting",
      "ARIMA",
      "SARIMA",
      "SQL",
      "Power BI",
      "Looker",
      "Data Analytics",
      "KPI Dashboards",
      "Decision Support",
    ],
  },
] as const;

export const marks = ["VLCC", "GlobalLogic", "EngineeringThing AI", "SISL Infotech", "Prakhar"];

export const roles = [
  {
    index: "01",
    year: "2025",
    company: "VLCC Healthcare Limited",
    title: "Programme Manager – AI & Digital Transformation",
    period: "June 2025 – Present",
    place: "Delhi NCR, India",
    detail:
      "Enterprise AI across computer vision, generative AI, workforce platforms and business intelligence.",
  },
  {
    index: "02",
    year: "2025",
    company: "SISL Infotech Private Limited",
    title: "Data Analyst",
    period: "January 2025 – May 2025",
    place: "India · NIC — CMO / PMO",
    detail: "Analytics delivery on CMO / PMO initiatives, with reporting that supported programme decisions.",
  },
  {
    index: "03",
    year: "2020",
    company: "GlobalLogic Technologies",
    title: "Senior Analyst",
    period: "August 2020 – February 2024",
    place: "India · Google India",
    detail: "Analytics and delivery for Google India programmes, from engineering support to senior analyst work.",
  },
  {
    index: "04",
    year: "2019",
    company: "Prakhar Software Solutions",
    title: "Software Engineer – AI / NLP",
    period: "June 2019 – March 2020",
    place: "India",
    detail: "AI and NLP engineering — conversational systems and text processing in production workflows.",
  },
];

export const education = [
  {
    title: "M.Tech · Artificial Intelligence",
    detail: "NIET · 84% · 2020 – 2022",
  },
  {
    title: "B.Tech · Electronics and Communication",
    detail: "Jamia Hamdard · 70% · 2015 – 2019",
  },
];

export const projects = [
  {
    index: "#01 · In development",
    name: "Geonexis",
    summary:
      "AI field workforce, attendance and sales intelligence. GPS check-in, face verification, and beat tracking across iOS, Android and web.",
    role: "Programme Manager & Solution Architect · 2025 – Present",
    image: "/images/projects/geonexis-cover.png",
    overview:
      "Geonexis is a multi-platform SaaS system for field workforce management and sales execution. It combines GPS attendance, facial verification, meeting intelligence and manager analytics into one operational platform for iOS, Android and web.",
    features: ["GPS check-in and check-out", "Face verification", "Workforce and beat tracking", "Meeting transcription", "iOS, Android and web"],
    technologies: ["SwiftUI", "React", "Next.js", "FastAPI", "PostgreSQL", "WebSockets", "Whisper", "InsightFace", "Docker", "AWS"],
    github: "https://github.com/i-am-rohit/geonexis",
    impact: "Unified attendance, field discipline and sales execution visibility in one platform.",
  },
  {
    index: "#02 · Deployed",
    name: "SWISS",
    summary:
      "Real-time computer vision for clinics, retail, factories and warehouses. Footfall, entry and exit, and staff recognition.",
    role: "Programme Manager & AI Architect · 2025 – Present",
    image: "/images/projects/swiss-cover.png",
    overview:
      "Smart Workforce & Inventory Surveillance System (SWISS) turns CCTV streams into operational intelligence — unique footfall, entry/exit tracking, staff recognition, occupancy and multi-location monitoring.",
    features: ["CCTV video analytics", "Unique footfall measurement", "Entry and exit tracking", "Staff recognition", "Occupancy analysis"],
    technologies: ["YOLO", "DeepSORT", "OpenCV", "Python", "Django", "FastAPI", "PostgreSQL", "Docker", "AWS"],
    impact: "Enabled data-driven operational decision-making across clinic and retail locations.",
  },
  {
    index: "#03 · In development",
    name: "FUSION",
    summary: "Document utility with OCR, AI summarisation and semantic search across mixed file sets.",
    role: "AI Product Builder & Solution Architect · 2025 – Present",
    image: "/images/projects/fusion-cover.png",
    overview:
      "FUSION is an AI-powered file utility that turns unstructured documents into searchable, summarised intelligence with OCR, document understanding and smart navigation.",
    features: ["OCR for scanned documents", "AI summarisation", "Semantic search", "Smart navigation from summary to source", "Mixed file formats"],
    technologies: ["Python", "OCR", "LLMs", "RAG", "FastAPI", "PostgreSQL", "Vector Search", "Next.js"],
    impact: "Reduced time spent manually scanning long document sets.",
  },
  {
    index: "#04 · Prototype",
    name: "Shadon",
    summary: "Private local AI assistant with voice, retrieval and long-term memory.",
    role: "AI Engineer & Product Builder · Personal R&D",
    image: "/images/projects/shadon-cover.png",
    overview:
      "Shadon is a private local AI assistant for voice and text, retrieval-augmented generation and persistent memory — keeping inference and knowledge closer to the user.",
    features: ["Local LLMs", "Retrieval-augmented generation", "Voice input", "Speech transcription", "Text-to-speech"],
    technologies: ["Ollama", "Qwen", "Phi", "Faster-Whisper", "FAISS", "Sentence Transformers", "Django REST Framework", "PostgreSQL"],
    github: "https://github.com/i-am-rohit/SHADON-AI",
    impact: "Demonstrates applied Generative AI with private local inference.",
  },
  {
    index: "#05 · Completed",
    name: "HR Chatbot",
    summary: "NLP assistant for employee support, onboarding, candidate screening and interview scheduling.",
    role: "Conversational AI",
    image: "/images/projects/hr-chatbot-cover.png",
    overview:
      "An NLP-powered HR assistant that automates candidate screening, interview scheduling and common employee support workflows using conversational AI.",
    features: ["Employee and candidate queries", "Interview scheduling", "Onboarding support", "Intent classification", "Dialogue refinement"],
    technologies: ["Rasa", "Python", "spaCy", "NLP", "SQL", "APIs"],
    github: "https://github.com/i-am-rohit/RASA",
    impact: "Reduced recruiter workload through conversational automation.",
  },
  {
    index: "#06 · In use",
    name: "Enterprise BI Dashboards",
    summary: "Executive dashboards for finance, inventory, procurement and sales, built in Power BI.",
    role: "Data & Analytics",
    image: "/images/projects/enterprise-bi-cover.png",
    overview:
      "A suite of executive Business Intelligence dashboards in Power BI that surface financial, inventory, procurement and operational KPIs.",
    features: ["Automated refresh", "Financial KPIs", "Inventory analytics", "Procurement analytics", "Sales reporting"],
    technologies: ["Power BI", "SQL", "DAX", "Power Query", "Excel"],
    impact: "Improved business visibility for executive decision-making.",
  },
  {
    index: "#07 · Published",
    name: "Drowsiness Alertness for Driver Safety",
    summary: "Research paper on real-time driver monitoring from facial landmarks, with eye and mouth cues and an audio alert.",
    role: "Computer Vision · Research",
    paperHref: "https://ieeexplore.ieee.org/document/10040365",
    image: "/images/projects/drowsiness-cover.png",
    overview:
      "Published research on a smart driver-safety system that tracks fatigue while driving. Drowsiness is detected from blinking and yawning using computer vision — Eye Aspect Ratio (EAR) and Mouth Aspect Ratio (MAR) — then the driver is alerted by an audio beep. The work is framed as an ADAS-oriented approach car makers can use to reduce accidents caused by tired driving.",
    features: ["Real-time facial landmark tracking", "EAR-based drowsiness cues", "MAR yawn detection", "Instant audio alerts", "IEEE published research paper"],
    technologies: ["Python", "OpenCV", "Machine Learning", "Deep Learning", "Facial Landmark Detection", "Histogram Equalization", "Canny Edge Detection"],
    github: "https://github.com/i-am-rohit/Drowsiness-Alertness-Using-Machine-Learning-Technique",
    impact: "Published research paper: Drowsiness Alertness for Driver Safety (IEEE).",
  },
  {
    index: "#08 · Published",
    name: "COVID Analysis Using Machine Learning",
    summary:
      "Forecasting confirmed, recovered and death trends from historical pandemic data, with EDA, preprocessing and Prophet-based time-series prediction.",
    role: "Machine Learning · Research · 2021",
    paperHref: "https://link.springer.com/chapter/10.1007/978-981-19-7402-1_26",
    image: "/images/projects/covid-analysis-cover.svg",
    overview:
      "A research project that applies AI, machine learning and data science to COVID-19 case histories. It analyses confirmed, recovered and death counts, then forecasts future trends to support healthcare planning and resource allocation. The modelling uses Facebook Prophet (sklearn-style fit/predict) with Python, pandas, NumPy, Matplotlib, Seaborn and scikit-learn.",
    features: [
      "Historical COVID-19 dataset analysis",
      "Time-series forecasting of confirmed, recovered and death cases",
      "Data preprocessing, cleaning and feature engineering",
      "Facebook Prophet and scikit-learn models",
      "Interactive visualisation and statistical insight",
    ],
    technologies: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-learn", "Facebook Prophet", "Jupyter Notebook"],
    github: "https://github.com/i-am-rohit/covid-analysis-using-machine-learning",
    impact: "Published by Springer (2 March 2023) in Inventive Computation and Information Technologies, Lecture Notes in Networks and Systems, volume 563.",
  },
  {
    index: "#09 · Deployed",
    name: "PDF to Text Convert",
    summary:
      "Secure PDF-to-text, Word and image conversion for PMO and CMO offices — OCR and NLP on scanned and digital files.",
    role: "Data Analyst · SISL Infotech · 2025",
    image: "/images/projects/pdf-to-text-cover.svg",
    overview:
      "An automated document digitization pipeline built for CMO and PMO offices. Officers upload confidential PDFs — including scans and image-based pages — and receive searchable text, Word output and extracted images. Python, Django and Docker run the conversion securely, with OCR and NLP for unstructured files that basic copy-paste cannot handle.",
    features: [
      "PDF to text, Word and image conversion",
      "OCR for scanned and image-based PDFs",
      "NLP parsing and information extraction",
      "Structured output for downstream workflows",
      "Secure processing of confidential government files",
    ],
    technologies: ["Python", "Django", "Docker", "OCR", "NLP", "PyPDF2", "pdfplumber", "PyMuPDF", "Pandas", "Regex"],
    impact: "Cut manual document processing for CMO and PMO operations and made large PDF sets searchable and editable.",
  },
];

export const skillLogos = [
  { name: "Python", src: "/images/skills-logos/python.png" },
  { name: "TensorFlow", src: "/images/skills-logos/TensorFlow.png" },
  { name: "PyTorch", src: "/images/skills-logos/Pytorch.png" },
  { name: "OpenAI", src: "/images/skills-logos/OPENAI.png", invert: true },
  { name: "Hugging Face", src: "/images/skills-logos/HUGGINGFACE.png" },
  { name: "LangChain", src: "/images/skills-logos/LANGCHAIN.png" },
  { name: "Scikit-learn", src: "/images/skills-logos/Scikit.png" },
  { name: "OpenCV", src: "/images/skills-logos/OpenCV.png" },
  { name: "AWS", src: "/images/skills-logos/AWS.png" },
  { name: "Docker", src: "/images/skills-logos/DOCKER.png" },
  { name: "HTML", src: "/images/skills-logos/HTML.png" },
  { name: "CSS", src: "/images/skills-logos/CSS.png" },
  { name: "React", src: "/images/skills-logos/REACT.png" },
  { name: "Django", src: "/images/skills-logos/DJANGO.png", invert: true },
  { name: "SQL", src: "/images/skills-logos/SQL.png" },
  { name: "Tableau", src: "/images/skills-logos/Tableau.png" },
  { name: "Power BI", src: "/images/skills-logos/POWERBI.png" },
  { name: "Ngrok", src: "/images/skills-logos/NGROK.png", invert: true },
];

export const skills = [
  {
    index: "01",
    name: "Generative & Agentic AI",
    items: ["LLMs", "Prompt Engineering", "RAG", "AI Agents", "LangChain", "LangGraph", "OpenAI", "Hugging Face", "Ollama", "Vector Databases"],
  },
  {
    index: "02",
    name: "Computer Vision",
    items: ["YOLOv8", "OpenCV", "DeepSORT", "Object Detection", "Face Recognition", "Video Analytics", "Footfall", "Occupancy", "Tracking", "Real-time Inference"],
  },
  {
    index: "03",
    name: "Natural Language Processing",
    items: ["NLP", "Chatbots", "Rasa", "spaCy", "Semantic Search", "Document Summarisation", "Meeting Transcription", "Multilingual Speech"],
  },
  {
    index: "04",
    name: "Machine Learning",
    items: ["Python", "Scikit-learn", "TensorFlow", "PyTorch", "Classification", "Predictive Analytics", "Time-Series", "ARIMA / SARIMA", "Feature Engineering", "Model Evaluation"],
  },
  {
    index: "05",
    name: "Data & Analytics",
    items: ["Power BI", "Tableau", "SQL", "DAX", "Power Query", "Data Modelling", "Dashboards", "KPI Frameworks", "Looker"],
  },
  {
    index: "06",
    name: "Engineering & Cloud",
    items: ["Next.js", "React", "FastAPI", "Django", "PostgreSQL", "Docker", "AWS", "REST APIs", "Git / GitHub", "OCR / Document Intelligence"],
  },
  {
    index: "07",
    name: "Programme Leadership",
    items: ["Solution Architecture", "Requirement Analysis", "Delivery", "Stakeholder Alignment", "PoC to Production", "Adoption"],
  },
];

export const certificateCategories = ["All", "AI", "Data Science", "Cloud", "Programming", "Development"] as const;

export const certificates = [
  {
    id: "machine-learning",
    category: "AI",
    name: "Machine Learning",
    issuer: "CETPA Infotech",
    issueDate: "November 2019",
    image: "/images/certificates/ml-cetpa.jpg",
  },
  {
    id: "ml-with-python-ibm",
    category: "AI",
    name: "Machine Learning with Python",
    issuer: "IBM · ExcelR Solutions",
    issueDate: "October 2023",
    image: "/images/certificates/ibm-excelr.jpg",
    credentialUrl: "https://courses.excelr.skillsnetwork.site/certificates/3a328eaa282e446b9927c5760d2371a4",
  },
  {
    id: "data-science",
    category: "Data Science",
    name: "Data Science",
    issuer: "Training Programme",
    image: "/images/certificates/data-science.jpg",
  },
  {
    id: "data-science-excelr",
    category: "Data Science",
    name: "Data Science",
    issuer: "ExcelR Solutions",
    issueDate: "September 2023",
    image: "/images/certificates/data-science-excelr.jpg",
  },
  {
    id: "internship-ds",
    category: "Data Science",
    name: "Internship – Data Science",
    issuer: "Internship Programme",
    image: "/images/certificates/internship-data-science.jpg",
  },
  {
    id: "tableau",
    category: "Data Science",
    name: "Tableau",
    issuer: "Training Programme",
    image: "/images/certificates/tableau.jpg",
  },
  {
    id: "aws-udemy",
    category: "Cloud",
    name: "Cloud Computing With Amazon Web Services",
    issuer: "Udemy",
    issueDate: "September 27, 2018",
    image: "/images/certificates/aws.jpg",
    credentialUrl: "https://ude.my/UC-56JFPQXP",
  },
  {
    id: "ai-fundamentals-cloud",
    category: "Cloud",
    name: "AI Fundamentals and the Cloud",
    issuer: "Amazon Web Services · Coursera",
    issueDate: "May 19, 2026",
    image: "/images/certificates/ai-fundamentals-cloud.jpg",
    credentialUrl: "https://coursera.org/verify/HKXSN7HBBFOF",
    pdfUrl: "/certificates/aws-ai-fundamentals-coursera.pdf",
  },
  {
    id: "python",
    category: "Programming",
    name: "Python",
    issuer: "Training Programme",
    issueDate: "November 2019",
    image: "/images/certificates/python.jpg",
  },
  {
    id: "linux",
    category: "Development",
    name: "Linux",
    issuer: "Training Programme",
    image: "/images/certificates/linux.jpg",
  },
  {
    id: "embedded-systems",
    category: "Development",
    name: "Embedded System",
    issuer: "Training Programme",
    image: "/images/certificates/embedded-systems.jpg",
  },
  {
    id: "iot",
    category: "Development",
    name: "Internet of Things",
    issuer: "Training Programme",
    image: "/images/certificates/iot.jpg",
  },
  {
    id: "web-development",
    category: "Development",
    name: "Web Development",
    issuer: "Training Programme",
    image: "/images/certificates/web-development.jpg",
  },
];

export const qrCodes = [
  {
    label: "Gmail",
    hint: "Tap to email",
    action: "Email jhurohit@gmail.com",
    href: "mailto:jhurohit@gmail.com",
    src: "/contact/qr/gmail.png",
  },
  {
    label: "LinkedIn",
    hint: "Tap to open",
    action: "Open LinkedIn",
    href: "https://www.linkedin.com/in/rohit-gusain-4aa831142/",
    src: "/contact/qr/linkedin.png",
  },
  {
    label: "WhatsApp",
    hint: "Tap to chat",
    action: "Open WhatsApp",
    href: "https://wa.me/918130464346",
    src: "/contact/qr/whatsapp.png",
  },
  {
    label: "Phone",
    hint: "Tap to call",
    action: "Call +91 81304 64346",
    href: "tel:+918130464346",
    src: "/contact/qr/phone.png",
  },
];

export const contactIcons = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/rohit-gusain-4aa831142/",
    src: "/contact/social/linkedin.png",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/predictive_engineer/",
    src: "/contact/social/instagram.svg",
  },
  {
    label: "GitHub",
    href: "https://github.com/i-am-rohit",
    src: "/contact/social/github.svg",
  },
  {
    label: "Kaggle",
    href: "https://www.kaggle.com/rohitgusain",
    src: "/contact/social/kaggle.png",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/gusain0001",
    src: "/contact/social/facebook.png",
  },
  {
    label: "X",
    href: "https://twitter.com/RohitGusain0001",
    src: "/contact/social/twitter.png",
  },
];

export const contacts = [
  { kind: "Email", label: "jhurohit@gmail.com", href: "mailto:jhurohit@gmail.com" },
  {
    kind: "Phone",
    links: [
      { label: "+91 81304 64346", href: "tel:+918130464346" },
      { label: "+91 99903 03070", href: "tel:+919990303070" },
    ],
  },
  { kind: "WhatsApp", label: "+91 81304 64346", href: "https://wa.me/918130464346" },
];
