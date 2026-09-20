/* ============================================================
   NODE REGISTRY

   A node is one unlockable piece of the profile. Each carries:
     - triggers : words/phrases that open it (server-side matching)
     - teaser   : the one line the AI may say about it BEFORE it
                  is unlocked. This is the only locked-node text
                  ever placed in the model's context.
     - payload  : which part of lib/profile to reveal once open

   tier orders discovery: a node's teaser only becomes available
   once the visitor has reached that tier, so the trail opens up
   gradually instead of dumping fourteen names at once.
   ============================================================ */

export type NodePayload =
  | { kind: "project"; id: string }
  | { kind: "experience"; org: string }
  | { kind: "cyber" }
  | { kind: "achievements" }
  | { kind: "leadership" }
  | { kind: "skills" }
  | { kind: "contact" }
  | { kind: "patents" };

export interface GameNode {
  id: string;
  label: string;
  /** Tier at which this node's teaser becomes visible to the AI. */
  tier: 0 | 1 | 2 | 3;
  teaser: string;
  triggers: string[];
  payload: NodePayload;
  secret?: boolean;
}

export const NODES: GameNode[] = [
  /* ---- tier 0: the first names a visitor ever sees ---------- */
  {
    id: "LEGALSHIELD",
    label: "LegalShield AI",
    tier: 0,
    teaser: "Something that reads regulation so lawyers do not have to.",
    triggers: [
      "legalshield", "legal shield", "legal", "gdpr", "dpdp", "hipaa",
      "compliance document", "pii", "redaction", "privacy platform",
    ],
    payload: { kind: "project", id: "legalshield" },
  },
  {
    id: "CITADEL",
    label: "CITADEL",
    tier: 0,
    teaser: "Named after a city. Watches one too.",
    triggers: [
      "citadel", "municipal", "smart city", "governance platform",
      "number plate", "traffic monitoring", "civic",
    ],
    payload: { kind: "project", id: "citadel" },
  },
  {
    id: "AURA",
    label: "AURA 3.0",
    tier: 0,
    teaser: "This one sees.",
    triggers: [
      "aura", "community pulse", "public safety", "yolo", "incident detection",
      "edge ai", "twilio", "telegram alert",
    ],
    payload: { kind: "project", id: "aura" },
  },
  {
    id: "ARGUS",
    label: "ARGUS",
    tier: 0,
    teaser: "Hundred-eyed. Looks at things people would rather it did not.",
    triggers: [
      "argus", "forensics", "forensic", "osint", "stylometry", "deepfake",
      "autopsy", "evidence", "investigation",
    ],
    payload: { kind: "project", id: "argus" },
  },

  /* ---- tier 1: opens once the trail is warm ----------------- */
  {
    id: "AGENTGATE",
    label: "Agent Governance Gateway",
    tier: 1,
    teaser: "Assumes the AI is already compromised and plans accordingly.",
    triggers: [
      "agent governance", "agentgate", "gateway", "authorization", "policy engine",
      "human in the loop", "mcp", "agent security", "privilege", "audit log",
      "prompt injection containment",
    ],
    payload: { kind: "project", id: "agentgate" },
  },
  {
    id: "PHANTOM",
    label: "PHANTOM TWIN",
    tier: 1,
    teaser: "Builds a copy of you and notices when you stop matching it.",
    triggers: [
      "phantom", "twin", "anomaly", "honeypot", "isolation forest",
      "credential stuffing", "behavioural", "behavioral", "fingerprint",
      "low and slow",
    ],
    payload: { kind: "project", id: "phantom" },
  },
  {
    id: "UPL",
    label: "UPL Limited",
    tier: 1,
    teaser: "He shipped something into a Fortune 500 and it is still running.",
    triggers: [
      "upl", "internship", "intern", "work", "worked", "works", "working",
      "experience", "job", "jobs", "career", "employer", "employed",
      "employment", "company", "companies", "professional", "fortune 500",
      "tprm", "vendor risk", "grc", "splunk", "crowdstrike", "netskope",
      "soc", "siem", "production", "industry",
    ],
    payload: { kind: "experience", org: "UPL Limited" },
  },
  {
    id: "JARVIS",
    label: "JARVIS",
    tier: 1,
    teaser: "Talks to Windows. Windows listens.",
    triggers: [
      "jarvis", "wincopilot", "voice", "automation suite", "powershell",
      "copilot", "win32", "desktop automation", "tts",
    ],
    payload: { kind: "project", id: "jarvis" },
  },

  /* ---- tier 2 ----------------------------------------------- */
  {
    id: "SICKLESETU",
    label: "SickleSetu",
    tier: 2,
    teaser: "The only one of these built for someone with no laptop.",
    triggers: [
      "sickle", "sicklesetu", "setu", "health", "healthcare", "asha",
      "medical", "genetic", "disha", "pwa", "rural",
    ],
    payload: { kind: "project", id: "sicklesetu" },
  },
  {
    id: "LAB",
    label: "The Lab",
    tier: 2,
    teaser: "Where the security work actually happens.",
    triggers: [
      "security", "cyber", "cybersecurity", "hacking", "red team", "redteam",
      "red teaming", "pentest", "penetration", "ctf", "lab", "threat",
      "malware", "incident response", "blue team",
    ],
    payload: { kind: "cyber" },
  },
  {
    id: "HACK",
    label: "Evidence Vault",
    tier: 2,
    teaser: "He wins these more often than is statistically polite.",
    triggers: [
      "hackathon", "hackathons", "competition", "won", "win", "wins", "award",
      "awards", "achievement", "achievements", "prize", "placed", "first place",
      "recognition", "accolade",
    ],
    payload: { kind: "achievements" },
  },
  {
    id: "STACK",
    label: "Stack",
    tier: 2,
    teaser: "The tools. Less interesting than what he did with them.",
    triggers: [
      "stack", "skills", "skill", "tech", "technology", "technologies",
      "languages", "language", "framework", "frameworks", "tools", "tooling",
      "certification", "certifications", "certified", "certificate",
      "proficient", "know", "python", "javascript", "typescript", "react",
      "fastapi", "docker", "kubernetes", "azure", "sql", "good at",
    ],
    payload: { kind: "skills" },
  },

  /* ---- tier 3 ----------------------------------------------- */
  {
    id: "ECELL",
    label: "E-Cell",
    tier: 3,
    teaser: "Two thousand people turned up to something he organised.",
    triggers: [
      "ecell", "e-cell", "entrepreneurship", "leadership", "event", "events",
      "outreach", "sponsorship", "club", "organiser", "organizer", "finance club",
      "bulls and bears", "podcast", "imuna", "mun",
    ],
    payload: { kind: "leadership" },
  },
  {
    id: "CONTACT",
    label: "Contact",
    tier: 3,
    teaser: "There is a way to reach him. You have not earned it yet.",
    triggers: [
      "contact", "email", "reach", "hire", "hiring", "recruit", "resume", "cv",
      "linkedin", "github", "get in touch", "talk to him", "phone", "call",
    ],
    payload: { kind: "contact" },
  },

  /* ---- SECRET: only at 14/14 -------------------------------- */
  {
    id: "PATENTS",
    label: "Patent Vault",
    tier: 3,
    teaser: "██ filings. Not at this access level.",
    triggers: [
      "patent", "patents", "filing", "filings", "ip", "intellectual property",
      "invention", "inventions", "research", "hardware security", "fpga",
    ],
    payload: { kind: "patents" },
    secret: true,
  },
];

export const PUBLIC_NODES = NODES.filter((n) => !n.secret);
export const SECRET_NODE = NODES.find((n) => n.secret)!;

export const nodeById = (id: string) => NODES.find((n) => n.id === id);

export const isValidNodeId = (id: string) => NODES.some((n) => n.id === id);
