/* ============================================================
   Shared types for the ARYAN.EXE profile data layer.

   Everything the site knows about Aryan lives in lib/profile/*.
   Three consumers read from it:
     1. /portfolio            — renders it directly
     2. lib/game/nodes.ts     — references it as unlockable payloads
     3. lib/llm/prompt.ts     — assembles the AI's context from it

   Nothing here is invented. Every field traces to a resume in
   resumes/, a repo under github.com/Boredem125, or the patent
   filings in E:\Downloads\Patent.
   ============================================================ */

export interface Identity {
  name: string;
  handle: string;
  title: string;
  location: string;
  tagline: string;
  summary: string;
  focusAreas: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  location: string;
  cgpa: string;
  start: string;
  end: string;
  coursework: string[];
}

export interface Experience {
  org: string;
  orgNote?: string;
  role: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
  tags: string[];
}

export type ProjectCategory =
  | "ai-security"
  | "grc"
  | "forensics"
  | "civic"
  | "automation"
  | "health"
  | "learning";

export interface Project {
  id: string;
  name: string;
  tagline: string;
  category: ProjectCategory;
  /** The problem that made this worth building. */
  problem: string;
  /** What was actually built. */
  solution: string;
  /** How it hangs together. */
  architecture: string;
  /** The single hardest engineering problem in it. */
  challenge: string;
  /** What came of it. Only verifiable outcomes. */
  outcome: string;
  stack: string[];
  repo?: string;
  demo?: string;
  featured: boolean;
}

export type PatentCategory =
  | "ai-security"
  | "forensics"
  | "malware"
  | "web-app"
  | "other";

export interface Patent {
  id: string;
  title: string;
  category: PatentCategory;
  /** Headline result, where one has been published on a resume. */
  metric?: string;
}

export interface Achievement {
  place: string;
  event: string;
  detail?: string;
  venue?: string;
  year: string;
  project?: string;
}

export interface Leadership {
  org: string;
  role: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  status: "earned" | "ongoing";
}

export interface SkillGroup {
  label: string;
  skills: string[];
}

export interface CyberDomain {
  id: string;
  label: string;
  /** Terminal-log framing for THE LAB. */
  log: string;
  items: string[];
}

export interface Contact {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  githubUser: string;
  cv: string;
}
