import type { Project } from "@/types";

const GH = "https://github.com/Boredem125";

export const projects: Project[] = [
  {
    id: "agentgate",
    name: "Agent Governance Gateway",
    tagline: "Separates what an AI agent can do from what it is allowed to do.",
    category: "ai-security",
    problem:
      "An autonomous coding agent runs with the full authority of the person who launched it. Capability and authority are the same thing, so a single prompt injection turns a helpful agent into an insider threat with shell access.",
    solution:
      "Authorization and governance infrastructure that sits between the agent and the system it acts on. A four-tier policy engine classifies every action — shell, file writes, network, reads — and privileged calls are intercepted before execution, approved by a named human, then run outside the agent's own context.",
    architecture:
      "Python and FastAPI behind an MCP channel. Interception happens through PreToolUse hooks, so the agent cannot execute a privileged call without the gateway seeing it first. Every decision lands in a tamper-evident chained audit log, and the policy engine carries non-removable self-protection constraints so the agent cannot rewrite its own permissions.",
    challenge:
      "Fail-closed behaviour. An authorization layer that silently fails open under error conditions is worse than none at all, because it manufactures confidence. Every error path had to deny by default while staying debuggable.",
    outcome:
      "117 tests passing. Treats prompt injection containment, privilege escalation and data exfiltration as distinct threat classes rather than one undifferentiated risk.",
    stack: ["Python", "FastAPI", "MCP", "Claude Code Hooks", "PowerShell"],
    featured: true,
  },
  {
    id: "tprm",
    name: "TPRM Automation Platform",
    tagline: "Replaced the spreadsheet a Fortune 500 ran vendor risk on.",
    category: "grc",
    problem:
      "Third-party risk at UPL lived in Excel. Assessing 40+ vendors meant manual scoring, no audit trail, no consistency between analysts, and no way for a CISO to see aggregate exposure without someone rebuilding a deck.",
    solution:
      "A production platform implementing composite risk scoring across Inherent, Residual and Composite dimensions, with evidence evaluation pipelines, conformity and non-conformity tracking, vendor questionnaire management, BCP risk mapping and CISO-level executive dashboards.",
    architecture:
      "Next.js 14 front end over Prisma and SQLite, with Groq-backed LLM scoring assistance and Recharts for the executive views. Python handles the automation pipelines; R performs statistical validation of model output.",
    challenge:
      "Stopping the LLM from quietly corrupting risk scores. A hallucinated severity rating that reaches a CISO dashboard is indistinguishable from a real one, so model output is validated statistically in R before it is allowed to affect a score.",
    outcome:
      "Live in production at UPL Limited across 42 parameters and 40+ vendors; roughly 70% reduction in manual analyst effort across 12+ compliance processes.",
    stack: ["Next.js 14", "Groq", "Prisma", "SQLite", "Recharts", "Python", "R"],
    featured: true,
  },
  {
    id: "legalshield",
    name: "LegalShield AI",
    tagline: "Regulatory document analysis and enterprise PII detection.",
    category: "grc",
    problem:
      "GDPR, DPDP and HIPAA review is document work at a volume no legal team can read through, and the PII that triggers those obligations is scattered across scans, exports and dynamic web pages rather than tidy database columns.",
    solution:
      "An AI platform automating regulatory document analysis, paired with enterprise PII detection that combines OCR, named-entity recognition and contextual LLM analysis, with RBAC and configurable redaction workflows.",
    architecture:
      "React and Vite on the front end, shipped as a Chrome extension for in-page extraction; FastAPI services behind it, containerised with Docker and orchestrated on Kubernetes. Processing pipelines run asynchronously so large document sets never block the request path.",
    challenge:
      "Reliable extraction from dynamic web pages, where content is assembled by scripts after load and the DOM is not stable at the moment of capture.",
    outcome: "99%+ reliable document extraction across dynamic pages.",
    stack: ["React", "Vite", "FastAPI", "Docker", "Kubernetes", "OCR", "NER", "Groq"],
    repo: `${GH}/LegalShield-AI`,
    featured: true,
  },
  {
    id: "argus",
    name: "ARGUS",
    tagline: "OSINT-integrated digital forensics platform.",
    category: "forensics",
    problem:
      "Forensic investigation produces evidence faster than an investigator can correlate it, and synthetic media has turned authorship and authenticity from settled questions into open ones.",
    solution:
      "A forensics platform combining stylometry for authorship attribution, deepfake detection for media authenticity, and automated evidence correlation across sources, with OSINT collection built into the workflow.",
    architecture:
      "Python and FastAPI with AI/ML models for stylometry and deepfake classification, integrating with Autopsy for conventional disk forensics so OSINT-derived and artefact-derived evidence share one correlation layer.",
    challenge:
      "Correlating evidence across sources that share no common identifier — linking an artefact on disk to an online persona when no field joins them.",
    outcome: "1st Place at the CDAC/MeitY Cyber Forensics Hackathon, against 70 teams.",
    stack: ["Python", "FastAPI", "OSINT", "Autopsy", "AI/ML"],
    repo: `${GH}/ARGUS`,
    featured: true,
  },
  {
    id: "phantom",
    name: "PHANTOM TWIN",
    tagline: "Behavioural anomaly detection that routes attackers into honeypots.",
    category: "ai-security",
    problem:
      "Credential stuffing and low-and-slow intrusion are built to stay under the thresholds that rate limits and static rules watch. By the time a signature fires, the session already looks legitimate.",
    solution:
      "Behavioural profiling of users and devices across geo-location, device fingerprints and peak-hour patterns, with high-risk sessions routed into honeypots rather than simply blocked — so the attacker keeps going while the defender watches.",
    architecture:
      "Python with an Isolation Forest anomaly model over a sliding-window heuristic engine, a React front end, and the Groq API for analysis.",
    challenge:
      "Detecting attacks designed to stay beneath detection thresholds, where any single event is unremarkable and only the shape across a window is not.",
    outcome:
      "Targets low-and-slow attack patterns and credential stuffing that threshold-based detection misses by construction.",
    stack: ["Python", "Isolation Forest", "React", "Groq API"],
    repo: `${GH}/Phantom-Twin`,
    featured: true,
  },
  {
    id: "citadel",
    name: "CITADEL",
    tagline: "AI-powered municipal governance platform.",
    category: "civic",
    problem:
      "Municipal governance runs on fragmented systems — traffic, documents, citizen services and enforcement each sit in their own silo, and nothing gives an administrator a single operational view of the city.",
    solution:
      "A municipal governance platform with a dual-portal architecture separating the administrative interface from the citizen-facing one, spanning eight intelligent modules across document processing, traffic monitoring and citizen services.",
    architecture:
      "Python backend with a dual-portal split so citizen access and administrative authority never share a surface. Modules cover document intelligence, live camera feeds, number-plate detection and sensor integration.",
    challenge:
      "Keeping eight independent modules coherent under one operational view without coupling them into a system where one failure takes the rest down.",
    outcome:
      "Eight modules spanning document processing, traffic monitoring and citizen services.",
    stack: ["Python", "Computer Vision", "Document Intelligence", "IoT Sensors"],
    repo: `${GH}/CITADEL`,
    featured: true,
  },
  {
    id: "aura",
    name: "AURA 3.0",
    tagline: "Community Pulse Intelligence for real-time public safety.",
    category: "civic",
    problem:
      "Public-safety incidents get reported after the fact, through channels that assume someone has already decided the event was worth reporting. The gap between an incident happening and anyone knowing is where the harm sits.",
    solution:
      "A real-time public safety platform with edge AI incident detection, asynchronous multi-channel alerting, and live Community Pulse Scores computed across five AI agents.",
    architecture:
      "FastAPI services with YOLOv8 for edge incident detection and Supabase for state, dispatching alerts asynchronously through both the Telegram API and Twilio voice so a single channel failure cannot suppress an alert.",
    challenge:
      "Running detection at the edge to keep latency low while keeping five agents' outputs consistent enough to produce one trustworthy score.",
    outcome: "Live Community Pulse Scores with async alerting across Telegram and Twilio voice.",
    stack: ["FastAPI", "YOLOv8", "Supabase", "Telegram API", "Twilio"],
    repo: `${GH}/AURA`,
    featured: true,
  },
  {
    id: "jarvis",
    name: "JARVIS",
    tagline: "Voice-driven Windows automation, no GUI required.",
    category: "automation",
    problem:
      "Desktop automation tools drive applications by simulating clicks, which breaks the moment a window moves, a layout changes or focus shifts. Natural-language desktop control needs something underneath that is not the GUI.",
    solution:
      "A voice-driven automation suite controlling native Windows applications through natural language — composing messages, scheduling meetings and triaging email threads hands-free.",
    architecture:
      "PowerShell with a modular command dispatcher mapping Copilot-generated intent onto Win32 API calls, giving system-level control — window management, focus switching, clipboard operations — without touching the GUI. Windows SAPI and custom TTS pipelines close the loop with spoken confirmation.",
    challenge:
      "Mapping open-ended natural-language intent onto a fixed, typed surface of Win32 calls without the dispatcher becoming an unmaintainable pile of special cases.",
    outcome:
      "A fully hands-free operational loop over Teams and Outlook with real-time spoken task narration.",
    stack: ["PowerShell", "Microsoft Copilot API", "Win32 API", "Windows SAPI/TTS"],
    repo: `${GH}/Jarvis-Local`,
    featured: false,
  },
  {
    id: "sicklesetu",
    name: "SickleSetu",
    tagline: "Sickle cell carrier detection for frontline health workers.",
    category: "health",
    problem:
      "Sickle cell screening in rural India depends on ASHA workers operating without lab access, without reliable connectivity, and across languages most health software does not speak.",
    solution:
      "An AI-powered carrier detection platform built for frontline ASHA workers, with ML risk scoring, multilingual Indian language support, a genetic counselling chatbot named Disha, and automated NHM reporting.",
    architecture:
      "FastAPI backend with XGBoost and LightGBM for risk scoring, delivered as a PWA so it runs on low-end devices with intermittent connectivity. Supabase for data, n8n for the automated reporting pipelines into NHM.",
    challenge:
      "Building for intermittent connectivity and low-end hardware while keeping a genetic counselling conversation safe and comprehensible across multiple languages.",
    outcome:
      "Top 3 nationally at PULSE of Viksit Maharashtra 2026, the Maharashtra Medical Innovation Challenge.",
    stack: ["FastAPI", "XGBoost", "LightGBM", "n8n", "PWA", "Supabase"],
    repo: `${GH}/SickleSetu`,
    featured: true,
  },
  {
    id: "eportal",
    name: "Education Portal",
    tagline: "Learning platform with AI-generated comprehension checks.",
    category: "learning",
    problem:
      "Video-based self-study gives no signal about whether anything was understood. Learners finish a module with confidence that tracks watch time rather than comprehension.",
    solution:
      "A full-stack learning platform pairing YouTube API video modules with AI-generated quizzes, so understanding gets tested immediately against the material just watched.",
    architecture:
      "React front end on Firebase and Firestore, with the YouTube API supplying module content and an LLM generating quiz items per topic.",
    challenge:
      "Generating quiz questions that test the specific content of a given video rather than generic knowledge of its subject.",
    outcome: "Interactive topic exploration with real-time comprehension testing.",
    stack: ["React", "Firebase", "Firestore", "YouTube API", "OpenAI API"],
    repo: `${GH}/eportal`,
    featured: false,
  },
  {
    id: "flashgenius",
    name: "AI Flashcards",
    tagline: "Spaced repetition with context-aware generation.",
    category: "learning",
    problem:
      "Making flashcards is most of the work of using them, and the cards people write tend to test recognition rather than recall.",
    solution:
      "A tool that auto-generates subject-specific flashcards from a topic or an uploaded document, optimising retention through concise context-aware prompts and spaced repetition.",
    architecture:
      "TypeScript application with LLM-backed card generation and a spaced-repetition scheduler.",
    challenge:
      "Generating cards concise enough to be worth reviewing while retaining the context that makes an answer recallable.",
    outcome: "Auto-generated, context-aware decks from documents or bare topics.",
    stack: ["TypeScript", "React", "LLM APIs"],
    repo: `${GH}/ai-flashcard`,
    featured: false,
  },
  {
    id: "rudeai",
    name: "RudeAI",
    tagline: "A chatbot with a personality problem, on purpose.",
    category: "learning",
    problem:
      "Assistant personas converge on the same agreeable register, which makes them forgettable.",
    solution:
      "A deliberately sarcastic Gen-Z-themed chatbot built around tone and wit rather than helpfulness.",
    architecture: "JavaScript front end over an LLM API with a heavily shaped persona prompt.",
    challenge:
      "Holding a consistent comedic voice across open-ended conversation without the persona collapsing back into the default assistant register.",
    outcome: "Picked up a following among college students for its humour.",
    stack: ["JavaScript", "LLM APIs"],
    repo: `${GH}/RudeAI`,
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const projectById = (id: string) => projects.find((p) => p.id === id);
