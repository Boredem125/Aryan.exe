/* Shapes crossing the wire between /api/ask and the terminal client.
   Kept separate from types/index.ts so the client can import these
   without pulling in anything that touches lib/profile. */

export interface PanelSection {
  label?: string;
  body?: string;
  items?: string[];
  tags?: string[];
}

export interface Panel {
  id: string;
  label: string;
  kind: string;
  tagline?: string;
  sections: PanelSection[];
  link?: { label: string; href: string };
}

export interface ProgressSummary {
  nodes: string[];
  count: number;
  total: number;
  level: number;
  levelCode: string;
  levelLabel: string;
  complete: boolean;
  patentsUnlocked: boolean;
}

export interface AskResponse {
  reply: string;
  unlocks: string[];
  panels: Panel[];
  token: string;
  summary: ProgressSummary;
  source: "groq" | "fallback" | "system" | "throttle";
}
