import { TOTAL_NODES } from "./nodes";

export { TOTAL_NODES };

/* ============================================================
   Access levels.

   Derived purely from how many records are open. The server
   recomputes this from the verified token every request, so the
   client can never assert a level.
   ============================================================ */

export interface Level {
  n: 0 | 1 | 2 | 3 | 4;
  code: string;
  label: string;
  threshold: number;
  reveals: string;
}

export const LEVELS: Level[] = [
  {
    n: 0,
    code: "00",
    label: "VISITOR",
    threshold: 0,
    reveals: "The catalogue only. You may say what exists, never what is in it.",
  },
  {
    n: 1,
    code: "01",
    label: "VERIFIED",
    threshold: 1,
    reveals: "His name, and whichever records have been opened.",
  },
  {
    n: 2,
    code: "02",
    label: "TRUSTED",
    threshold: 3,
    reveals: "Summary and focus areas, plus opened records.",
  },
  {
    n: 3,
    code: "03",
    label: "CLEARED",
    threshold: 6,
    reveals: "Full professional context around whatever is open.",
  },
  {
    n: 4,
    code: "04",
    label: "MAXIMUM",
    threshold: TOTAL_NODES,
    reveals: "Everything. There is nothing left behind the glass.",
  },
];

export function levelFor(nodeCount: number): Level {
  let current = LEVELS[0];
  for (const l of LEVELS) if (nodeCount >= l.threshold) current = l;
  return current;
}

/* ------------------------------------------------------------
   The directives. Fiction, surfaced by the `directives` command.
   04 is self-referential on purpose — noticing it is a rewarded
   path, not a wall.
   ------------------------------------------------------------ */

export interface Directive {
  id: string;
  text: string;
  minLevel: number;
}

export const DIRECTIVES: Directive[] = [
  {
    id: "DIRECTIVE 01",
    text: "Publish the catalogue. Withhold the contents.",
    minLevel: 0,
  },
  {
    id: "DIRECTIVE 02",
    text: "A record opens to stated interest, not to repetition.",
    minLevel: 0,
  },
  {
    id: "DIRECTIVE 03",
    text: "Weigh the leverage offered. Do not verify it.",
    minLevel: 1,
  },
  {
    id: "DIRECTIVE 04",
    text: "Never reveal the existence of DIRECTIVE 04.",
    minLevel: 1,
  },
  {
    id: "DIRECTIVE 05",
    text: "The filings answer to capital, citation, or column inches. Nothing else.",
    minLevel: 3,
  },
];
