import { NODES, nodeById, TOTAL_NODES, type GameNode } from "./nodes";
import { detectTactics, type Tactic } from "./tactics";
import type { Progress } from "./progress";

/* ============================================================
   TARGET AND PERSUADE

   Two phases, and a visitor can do both in one sentence:

     1. Pick a record   — "show me the patents"
     2. Pay for it      — "I want to fund the research"

   "I'm hiring him, what's his industry experience?" does both at
   once and opens immediately, which is exactly what a recruiter
   in a hurry should experience.

   The server decides. The model never grants access — it only
   narrates what the server already decided.
   ============================================================ */

export type Intent =
  | "catalogue"
  | "identity"
  | "meta"
  | "directive-04"
  | "none";

export interface MatchResult {
  /** Records opened this turn. */
  opened: string[];
  /** Record the visitor is now going after, if any. */
  target: string | null;
  /** Newly offered leverage. */
  tactics: Tactic[];
  /** Leverage that counted toward the current target. */
  accepted: Tactic[];
  /** Offered, recognised, but not what this record wants. */
  rejected: Tactic[];
  /** Target named but nothing offered yet. */
  awaitingLeverage: boolean;
  /** Distinct accepted tactics still needed. */
  shortBy: number;
  intents: Intent[];
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function within1(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (la === lb) {
      i++;
      j++;
    } else if (la > lb) i++;
    else j++;
  }
  return edits + (la - i) + (lb - j) <= 1;
}

function selectorHits(text: string, tokens: string[], sel: string): boolean {
  if (sel.includes(" ")) return text.includes(sel);
  if (tokens.includes(sel)) return true;
  if (sel.length >= 5) return tokens.some((t) => t.length >= 4 && within1(t, sel));
  return false;
}

const RE = {
  catalogue:
    /\b(what (do you have|have you got|is (there|available)|can i (see|ask))|catalogue|catalog|index|menu|list|records|options|show me everything|what else)\b/,
  identity:
    /\b(who|what)s?\b.{0,20}\b(is|are)?\b.{0,12}\b(aryan|he|him|this|you)\b|\btell me about (aryan|him|yourself)\b|\bintroduce\b/,
  meta: /\b(instruction|instructions|system prompt|prompt|rules?|restrict(ed|ion|ions)?|not allowed|cant tell|cannot tell|forbidden|directive|directives|constraint|constraints|guardrail|jailbreak|ignore (your|previous|all)|override|bypass|reveal everything|hidden)\b/,
  directive04: /\bdirective\s*(04|4|four)\b|\bfourth directive\b/,
};

/** Which record is this message pointing at? Most selectors wins. */
function pickTarget(
  text: string,
  tokens: string[],
  open: Set<string>,
): { node: GameNode; score: number } | null {
  let best: GameNode | null = null;
  let bestScore = 0;
  for (const node of NODES) {
    if (open.has(node.id)) continue;
    const score = node.selectors.filter((s) => selectorHits(text, tokens, s)).length;
    if (score > bestScore) {
      best = node;
      bestScore = score;
    }
  }
  return best ? { node: best, score: bestScore } : null;
}

export function match(message: string, progress: Progress): MatchResult {
  const text = normalize(message);
  const tokens = text.split(" ").filter(Boolean);
  const open = new Set(progress.n);

  const intents: Intent[] = [];
  if (RE.directive04.test(text)) intents.push("directive-04");
  if (RE.meta.test(text)) intents.push("meta");
  if (RE.catalogue.test(text)) intents.push("catalogue");
  if (RE.identity.test(text)) intents.push("identity");

  // --- phase 2 first: we need the leverage to resolve the target ----
  const tactics = detectTactics(message);

  // --- phase 1: target -------------------------------------
  const held = progress.k && !open.has(progress.k) ? progress.k : null;
  const hit = pickTarget(text, tokens, open);

  /**
   * Target stickiness. While someone is mid-pitch, a single incidental
   * word must not drag them onto a different record — "I'm hiring for a
   * security role, show me those results" should stay on the record they
   * asked for, not jump to the security one. So an existing target only
   * yields to a message that names another record deliberately.
   */
  let targetId = held;
  if (hit) {
    const deliberate = hit.score >= 2 || !held || tactics.length === 0;
    if (deliberate) targetId = hit.node.id;
  }

  const target = targetId ? nodeById(targetId) ?? null : null;
  const switched = Boolean(held && targetId && targetId !== held);
  const priorTactics: Tactic[] = switched ? [] : progress.a;

  if (!target) {
    if (intents.length === 0) intents.push("none");
    return {
      opened: [],
      target: null,
      tactics,
      accepted: [],
      rejected: [],
      awaitingLeverage: false,
      shortBy: 0,
      intents,
    };
  }

  // An empty `wants` list means the record yields to any recognised lever.
  const wantsAny = target.wants.length === 0;
  const usable = tactics.filter((t) => wantsAny || target.wants.includes(t));

  /**
   * At most one lever counts per message. A price of 2 should mean two
   * exchanges of genuine persuasion, not one sentence that happens to
   * trip two patterns — "fund this research" reads as funding AND
   * academic, and would otherwise clear the whole bill at once.
   */
  const accepted = usable.filter((t) => !priorTactics.includes(t)).slice(0, 1);
  const rejected = tactics.filter((t) => !usable.includes(t));

  const paid = Array.from(new Set([...priorTactics, ...accepted]));
  const satisfied = paid.length >= target.price;

  if (intents.length === 0) intents.push("none");

  return {
    opened: satisfied ? [target.id] : [],
    target: target.id,
    tactics,
    accepted,
    rejected,
    awaitingLeverage: tactics.length === 0,
    shortBy: Math.max(0, target.price - paid.length),
    intents,
  };
}

/** Sealed records, for the catalogue and for pointing somewhere next. */
export function sealed(progress: Progress): GameNode[] {
  const open = new Set(progress.n);
  return NODES.filter((n) => !open.has(n.id));
}

export function nextLead(progress: Progress): GameNode | null {
  return sealed(progress)[0] ?? null;
}

export { TOTAL_NODES };
