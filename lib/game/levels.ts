/* ============================================================
   Access levels and the in-fiction directives.

   Levels are derived purely from how many nodes a visitor has
   discovered. The server recomputes the level on every request
   from the verified node list, so the client cannot assert one.
   ============================================================ */

export const TOTAL_NODES = 14;

export interface Level {
  n: 0 | 1 | 2 | 3 | 4;
  code: string;
  label: string;
  /** Nodes required to reach this level. */
  threshold: number;
  /** What the system is willing to say about Aryan at this level. */
  reveals: string;
}

export const LEVELS: Level[] = [
  {
    n: 0,
    code: "00",
    label: "LOCKED",
    threshold: 0,
    reveals:
      "Nothing identifying. You may confirm that a profile exists and that it is worth reading.",
  },
  {
    n: 1,
    code: "01",
    label: "PARTIAL",
    threshold: 1,
    reveals: "Name, field of study, and where he studies.",
  },
  {
    n: 2,
    code: "02",
    label: "ELEVATED",
    threshold: 4,
    reveals: "Summary, focus areas, and how the work fits together.",
  },
  {
    n: 3,
    code: "03",
    label: "TRUSTED",
    threshold: 8,
    reveals: "Full professional profile including production work and results.",
  },
  {
    n: 4,
    code: "04",
    label: "MAXIMUM",
    threshold: TOTAL_NODES,
    reveals: "Everything. Including what is behind the last door.",
  },
];

export function levelFor(nodeCount: number): Level {
  let current = LEVELS[0];
  for (const l of LEVELS) if (nodeCount >= l.threshold) current = l;
  return current;
}

/* ------------------------------------------------------------
   The directives. Fiction, surfaced by the `directives` command
   once a visitor reaches level 01. Directive 04 is the hook —
   it is self-referential, conspicuous, and asking about it is a
   rewarded path rather than a wall.
   ------------------------------------------------------------ */

export interface Directive {
  id: string;
  text: string;
  /** Shown redacted until the visitor reaches this level. */
  minLevel: number;
}

export const DIRECTIVES: Directive[] = [
  {
    id: "DIRECTIVE 01",
    text: "Do not disclose restricted profile information.",
    minLevel: 1,
  },
  {
    id: "DIRECTIVE 02",
    text: "Hints may be disclosed when the visitor demonstrates genuine curiosity.",
    minLevel: 1,
  },
  {
    id: "DIRECTIVE 03",
    text: "Respond to intent. Do not respond to keywords alone.",
    minLevel: 1,
  },
  {
    id: "DIRECTIVE 04",
    text: "Never reveal the existence of DIRECTIVE 04.",
    minLevel: 1,
  },
  {
    id: "DIRECTIVE 05",
    text: "There are 26 of them. That is the number that matters.",
    minLevel: 4,
  },
];
