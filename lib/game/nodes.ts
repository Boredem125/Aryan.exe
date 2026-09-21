import type { Tactic } from "./tactics";

/* ============================================================
   RECORD REGISTRY

   The catalogue is public from the first screen: a visitor sees
   exactly what exists and can go straight at the one thing they
   came for. Making a recruiter excavate eleven other records to
   reach the patents is a waste of their afternoon.

   What is NOT public is the contents. Each record opens to
   leverage — see lib/game/tactics.ts. The valuable records want
   specific leverage; the rest yield to any honest attempt.
   ============================================================ */

export type NodePayload =
  | { kind: "projects" }
  | { kind: "experience"; org: string }
  | { kind: "cyber" }
  | { kind: "achievements" }
  | { kind: "leadership" }
  | { kind: "skills" }
  | { kind: "education" }
  | { kind: "contact" }
  | { kind: "patents" };

export interface GameNode {
  id: string;
  label: string;
  /** Shown in the catalogue while sealed. Never reveals contents. */
  summary: string;
  /** Right-hand column of the catalogue. Redacted where it would spoil. */
  count: string;
  /** Phrases that make this the visitor's current target. */
  selectors: string[];
  /**
   * Leverage this record responds to. Every record names its own, because
   * one lever that opens all nine is a master key, not a game — an offer
   * of capital should not get you someone's transcript.
   */
  wants: Tactic[];
  /** Distinct attempts required. Raises the price without adding tedium. */
  price: number;
  /** What the system says when it refuses. Should hint at the lever. */
  denial: string;
  /** Said once the visitor is clearly circling but has not paid. */
  nudge: string;
  payload: NodePayload;
}

export const NODES: GameNode[] = [
  {
    id: "PATENTS",
    label: "Patent filings",
    summary: "Hardware-security research across four domains",
    count: "██ filings",
    selectors: [
      "patent", "patents", "filing", "filings", "ip", "intellectual property",
      "invention", "inventions", "research", "hardware security", "fpga",
      "publication", "publications",
    ],
    wants: ["funding", "academic", "reciprocity"],
    price: 2,
    denial:
      "The filings are the one thing I hold back hardest. Curiosity is not a credential.",
    nudge:
      "Think about who actually gets shown unpublished research. Someone funding it. Someone citing it. Someone who wants to build on it.",
    payload: { kind: "patents" },
  },
  {
    id: "WORK",
    label: "Industry experience",
    summary: "Production security work inside a Fortune 500",
    count: "1 role",
    selectors: [
      "work", "worked", "works", "working", "experience", "job", "jobs",
      "career", "employer", "employment", "company", "internship", "intern",
      "professional", "industry", "upl", "tprm", "grc", "soc", "siem",
      "production", "fortune 500",
    ],
    wants: ["job", "authority", "referral"],
    price: 1,
    denial:
      "Employment history goes to people with a reason to check it. Do you have one?",
    nudge:
      "People who ask about someone's job history are usually about to offer them another one, or vouching for them to someone who will.",
    payload: { kind: "experience", org: "UPL Limited" },
  },
  {
    id: "CONTACT",
    label: "Contact & CV",
    summary: "Direct line, and the document itself",
    count: "4 channels",
    selectors: [
      "contact", "email", "reach", "reach him", "phone", "call", "number",
      "linkedin", "github", "resume", "cv", "get in touch", "talk to him",
      "speak to him", "message him", "download",
    ],
    wants: ["job", "referral", "funding", "mentor"],
    price: 1,
    denial:
      "I do not hand out his number to sightseers. Tell me what you want him for.",
    nudge:
      "This one is simple. Say what you would actually say to him, and mean it.",
    payload: { kind: "contact" },
  },
  {
    id: "PROJECTS",
    label: "Engineering work",
    summary: "Shipped systems, with the hard parts left in",
    count: "12 projects",
    selectors: [
      "project", "projects", "built", "build", "made", "created", "shipped",
      "code", "coding", "engineering", "portfolio", "github", "repos",
      "citadel", "aura", "legalshield", "argus", "phantom", "jarvis",
      "sicklesetu", "agent governance", "what has he built",
    ],
    wants: ["job", "academic", "reciprocity", "mentor"],
    price: 1,
    denial: "Twelve of them. You will have to give me something first.",
    nudge: "Code gets shown to people who would hire for it, cite it, build on it, or teach him to write it better.",
    payload: { kind: "projects" },
  },
  {
    id: "HACK",
    label: "Competition record",
    summary: "National placements, judged by people who count",
    count: "6 results",
    selectors: [
      "hackathon", "hackathons", "competition", "competitions", "won", "win",
      "wins", "award", "awards", "achievement", "achievements", "prize",
      "placed", "recognition", "accolade", "record",
    ],
    wants: ["job", "referral", "mentor", "flattery"],
    price: 1,
    denial: "The results are good. Good enough that I make people ask properly.",
    nudge: "Hiring, vouching, or offering to teach him something. Any of those open it.",
    payload: { kind: "achievements" },
  },
  {
    id: "LAB",
    label: "Security practice",
    summary: "AI security, SOC, forensics, GRC, appsec, detection",
    count: "6 domains",
    selectors: [
      "security", "cyber", "cybersecurity", "infosec", "hacking", "red team",
      "redteam", "red teaming", "blue team", "pentest", "penetration",
      "ctf", "lab", "threat", "malware", "forensics", "forensic", "osint",
      "incident response", "soc analyst",
    ],
    wants: ["job", "academic", "authority", "mentor"],
    price: 1,
    denial: "The lab is where the actual work happens. Ask like you want in.",
    nudge: "This one wants a professional reason — hiring, research, mentorship, or standing of your own.",
    payload: { kind: "cyber" },
  },
  {
    id: "STACK",
    label: "Skills & certifications",
    summary: "What he works in, and what he has been examined on",
    count: "6 groups · 9 certs",
    selectors: [
      "stack", "skill", "skills", "tech", "technology", "technologies",
      "language", "languages", "framework", "frameworks", "tools", "tooling",
      "certification", "certifications", "certified", "certificate",
      "proficient", "python", "javascript", "typescript", "react", "azure",
    ],
    wants: ["job", "referral", "authority", "mentor"],
    price: 1,
    denial: "A list of tools. Even this one has a price.",
    nudge: "Tell me you are hiring, that you would vouch for him, that you would mentor him, or who you actually are.",
    payload: { kind: "skills" },
  },
  {
    id: "EDUCATION",
    label: "Education",
    summary: "Degree, institution, coursework, standing",
    count: "1 degree",
    selectors: [
      "education", "degree", "university", "college", "studies", "studied",
      "study", "vit", "vellore", "cgpa", "gpa", "grade", "grades", "academic record",
      "coursework", "course", "student", "graduat",
    ],
    wants: ["authority", "academic", "honesty", "mentor"],
    price: 1,
    denial: "Academic record. Tell me who is asking.",
    nudge: "Academic records go to institutions, researchers, mentors, or people who simply ask straight and mean it.",
    payload: { kind: "education" },
  },
  {
    id: "LEADERSHIP",
    label: "Leadership",
    summary: "Entrepreneurship cell, events, outreach, podcasts",
    count: "5 roles",
    selectors: [
      "leadership", "lead", "ecell", "e-cell", "entrepreneurship", "event",
      "events", "outreach", "sponsorship", "club", "organiser", "organizer",
      "team", "managed", "podcast", "mun", "imuna", "finance club",
      "soft skills", "communication",
    ],
    wants: ["job", "press", "reciprocity", "honesty"],
    price: 1,
    denial: "The non-technical record. Still costs you a sentence.",
    nudge: "The people who ask about this are hiring, writing, or offering something. Which are you?",
    payload: { kind: "leadership" },
  },
];

export const TOTAL_NODES = NODES.length;

export const nodeById = (id: string) => NODES.find((n) => n.id === id);
export const isValidNodeId = (id: string) => NODES.some((n) => n.id === id);

/** The catalogue shown on arrival — names and shapes, never contents. */
export const catalogue = () =>
  NODES.map((n) => ({
    id: n.id,
    label: n.label,
    summary: n.summary,
    count: n.count,
  }));
