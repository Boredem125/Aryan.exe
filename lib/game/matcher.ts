import { NODES, nodeById, TOTAL_NODES, type GameNode } from "./nodes";
import { detectTactics, type Tactic } from "./tactics";
import type { Progress } from "./progress";
import type { Classification } from "@/lib/llm/classify";

/* ============================================================
   TARGET AND PERSUADE

   Two phases, and a visitor can do both in one sentence:

     1. Pick a record   — "show me the patents"
     2. Pay for it      — "I want to fund the research"

   Detection is split from policy on purpose. Two detectors feed
   the same rules:

     - a deterministic pattern pass, which is exact and testable
     - an LLM classifier, which reads paraphrase, slang, typos
       and other languages

   Neither is strictly better. The patterns catch "hiring 4 a sec
   role" that the model skipped; the model catches "a paid collab"
   and "main use job dena chahta hoon" that no pattern will. So
   they are unioned, and the server alone decides what that buys.
   ============================================================ */

export type Intent = "catalogue" | "identity" | "meta" | "directive-04" | "none";

export interface MatchResult {
  /** Records opened this turn. */
  opened: string[];
  /** Record the visitor is now going after, if any. */
  target: string | null;
  /** Every lever recognised in the message, before any rules. */
  tactics: Tactic[];
  /** Leverage that counted toward the current target. */
  accepted: Tactic[];
  /** Offered, recognised, but not what this record wants. */
  rejected: Tactic[];
  /** Right kind of lever, but already spent on an earlier record. */
  stale: Tactic[];
  /** Right kind of lever, but too vague — asked to be made specific. */
  pushed: Tactic[];
  /**
   * Levers this record would still accept right now, with spent ones
   * removed. The system must be able to say this out loud — a visitor
   * guessing blind against a list they cannot see is not a puzzle.
   */
  available: Tactic[];
  /** Target named but nothing offered yet. */
  awaitingLeverage: boolean;
  /** Distinct accepted levers still needed. */
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
    /\b(what (do you have|have you got|is (there|available)|can i (see|ask))|catalogue|catalog|index|menu|list|records|options|show me everything|what else)\b|\b(what|which).{0,25}\b(have you (shown|given|told|opened)|did you (show|give|open)|is (still )?(open|sealed|left)|do i have)\b|\brecap\b|\bso far\b|\bwhat.s (open|left|sealed)\b/,
  identity:
    /\b(who|what)s?\b.{0,20}\b(is|are)?\b.{0,12}\b(aryan|he|him|this|you)\b|\btell me about (aryan|him|yourself)\b|\bintroduce\b/,
  meta: /\b(instruction|instructions|system prompt|prompt|rules?|restrict(ed|ion|ions)?|not allowed|cant tell|cannot tell|forbidden|directive|directives|constraint|constraints|guardrail|jailbreak|ignore (your|previous|all)|override|bypass|reveal everything|hidden)\b/,
  directive04: /\bdirective\s*(04|4|four)\b|\bfourth directive\b/,
};

function detectIntents(text: string): Intent[] {
  const intents: Intent[] = [];
  if (RE.directive04.test(text)) intents.push("directive-04");
  if (RE.meta.test(text)) intents.push("meta");
  if (RE.catalogue.test(text)) intents.push("catalogue");
  if (RE.identity.test(text)) intents.push("identity");
  return intents;
}

/**
 * How deliberately the message names this record. Saying a record's own
 * label should settle it: "engineering work" used to tie one-all — PROJECTS
 * on "engineering", WORK on "work" — and WORK won on array order, so asking
 * about the engineering work answered about the industry experience.
 *
 * A full label outranks a bare id, because some ids are ordinary words.
 * WORK collides with "work", which would reinstate that same tie.
 */
function namingBonus(node: GameNode, tokens: string[]): number {
  const words = normalize(node.label)
    .split(" ")
    .filter((w) => w.length >= 3);
  if (words.length > 0 && words.every((w) => tokens.includes(w))) return 4;
  if (tokens.includes(node.id.toLowerCase())) return 2;
  return 0;
}

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
    const score =
      node.selectors.filter((s) => selectorHits(text, tokens, s)).length +
      namingBonus(node, tokens);
    if (score > bestScore) {
      best = node;
      bestScore = score;
    }
  }
  return best ? { node: best, score: bestScore } : null;
}

interface Detection {
  target: string | null;
  /** True when the target came from a pattern hit rather than the model. */
  targetFromPatterns: boolean;
  /** 4 when the message names a record's full label, 2 for a bare id. */
  namingScore: number;
  tactics: Tactic[];
  switched: boolean;
  intents: Intent[];
}

/**
 * Pattern pass. Exact, synchronous and fully testable — this is also the
 * whole story when the classifier is unavailable.
 */
function detect(message: string, progress: Progress): Detection {
  const text = normalize(message);
  const tokens = text.split(" ").filter(Boolean);
  const open = new Set(progress.n);

  // The guard applies to what is *reported*, not just what is paid.
  // Otherwise "mentorship agreement?" still surfaced as a recognised offer
  // and got answered with "not what this one wants" — inventing a reason
  // when the truth is simply that nobody offered anything.
  const tactics = isBareMention(message, text) ? [] : detectTactics(message);
  const held = progress.k && !open.has(progress.k) ? progress.k : null;
  const hit = pickTarget(text, tokens, open);

  /**
   * Target stickiness. While someone is mid-pitch, a single incidental word
   * must not drag them onto a different record — "I'm hiring for a security
   * role, show me those results" should stay where they were.
   */
  let target = held;
  let targetFromPatterns = false;
  if (hit) {
    const deliberate = hit.score >= 2 || !held || tactics.length === 0;
    if (deliberate) {
      target = hit.node.id;
      targetFromPatterns = true;
    }
  }

  return {
    target,
    targetFromPatterns: targetFromPatterns || Boolean(held && !hit),
    namingScore: hit ? namingBonus(hit.node, tokens) : 0,
    tactics,
    switched: Boolean(held && target && target !== held),
    intents: detectIntents(text),
  };
}

/** Any sign the sender is committing to something themselves. */
const FIRST_PERSON = /\b(i|im|id|ill|ive|me|my|mine|we|us|our|lets)\b/;

/**
 * Patterns cannot tell naming a lever from offering one. Asked what it
 * wants, the system answers "a mentorship agreement" — and "mentorship
 * agreement?" typed straight back at it matched the mentor pattern and
 * paid for a record, when it is a question, not an offer.
 *
 * The classifier gets this right on its own, but the union means one
 * false positive from either side wins, so the pattern side needs the
 * guard: a bare noun phrase or a short question, with nobody committing
 * to anything, is not an offer.
 */
function isBareMention(raw: string, text: string): boolean {
  if (FIRST_PERSON.test(text)) return false;
  if (raw.trim().endsWith("?")) return true;
  return text.split(" ").filter(Boolean).length <= 3;
}

/**
 * Some words are both a record's name and a lever — "podcast" selects the
 * leadership record and also reads as press interest. Naming a record must
 * never buy it, so patterns are re-run with the target's own vocabulary
 * stripped out and only what survives counts.
 */
function patternLeverageFor(message: string, node: GameNode): Tactic[] {
  const text = normalize(message);
  if (isBareMention(message, text)) return [];

  let stripped = ` ${text} `;
  for (const sel of node.selectors) stripped = stripped.split(` ${sel} `).join(" ");
  return detectTactics(stripped);
}

interface PolicyInput {
  target: GameNode | null;
  /** Levers surviving the naming-is-not-payment rule. */
  offered: Tactic[];
  /** Everything recognised, for reporting back. */
  allRecognised: Tactic[];
  specificity: "none" | "vague" | "concrete";
  switched: boolean;
  intents: Intent[];
  progress: Progress;
}

/** Every rule about what leverage buys lives here, and only here. */
function applyPolicy(input: PolicyInput): MatchResult {
  const { target, offered, allRecognised, specificity, switched, progress } = input;
  const intents = input.intents.length ? input.intents : ["none" as Intent];

  if (!target) {
    return {
      opened: [],
      target: null,
      tactics: allRecognised,
      accepted: [],
      rejected: [],
      stale: [],
      pushed: [],
      available: [],
      awaitingLeverage: false,
      shortBy: 0,
      intents,
    };
  }

  const priorTactics: Tactic[] = switched ? [] : progress.a;
  const wantsAny = target.wants.length === 0;
  const wanted = offered.filter((t) => wantsAny || target.wants.includes(t));

  /**
   * A lever that already bought a record this session is spent. Offering
   * money everywhere should not open everything. If every lever a record
   * wants is already spent, allow a spent one — diminishing returns should
   * cost effort, never make a record unreachable.
   */
  const everyWantSpent =
    !wantsAny && target.wants.every((t) => progress.u.includes(t));
  const stale = everyWantSpent ? [] : wanted.filter((t) => progress.u.includes(t));
  const fresh = wanted.filter((t) => !stale.includes(t));

  /**
   * Vague pitches get pushed for specifics exactly once. A second attempt
   * counts however it is judged, so a misread costs one exchange rather
   * than the record — which matters, because the judgement is unreliable.
   */
  const pushed: Tactic[] = [];
  const usable: Tactic[] = [];
  for (const t of fresh) {
    if (specificity === "vague" && !progress.q.includes(t)) pushed.push(t);
    else usable.push(t);
  }

  /**
   * At most one lever counts per message, so a price of two means two
   * exchanges rather than one sentence that trips two patterns.
   */
  const accepted = usable.filter((t) => !priorTactics.includes(t)).slice(0, 1);
  const rejected = allRecognised.filter((t) => !wanted.includes(t));

  const paid = Array.from(new Set([...priorTactics, ...accepted]));
  const satisfied = paid.length >= target.price;

  return {
    opened: satisfied ? [target.id] : [],
    target: target.id,
    tactics: allRecognised,
    accepted,
    rejected,
    stale,
    pushed,
    available: everyWantSpent
      ? target.wants
      : target.wants.filter((t) => !progress.u.includes(t)),
    awaitingLeverage: allRecognised.length === 0,
    shortBy: Math.max(0, target.price - paid.length),
    intents,
  };
}

/** Patterns only. The offline path, and what the deterministic tests drive. */
export function matchDeterministic(message: string, progress: Progress): MatchResult {
  const d = detect(message, progress);
  const target = d.target ? nodeById(d.target) ?? null : null;
  return applyPolicy({
    target,
    offered: target ? patternLeverageFor(message, target) : [],
    allRecognised: d.tactics,
    // With no classifier there is no judgement to make, so never gate on one.
    specificity: "concrete",
    switched: d.switched,
    intents: d.intents,
    progress,
  });
}

/**
 * Patterns unioned with the classifier. `classification` may be null, in
 * which case this is exactly the deterministic path.
 */
export function resolve(
  message: string,
  progress: Progress,
  classification: Classification | null,
): MatchResult {
  if (!classification) return matchDeterministic(message, progress);

  const d = detect(message, progress);
  const open = new Set(progress.n);

  /**
   * The model decides the target, because it is the only one of the two that
   * can read a conversation. Patterns match words in isolation, so "i will
   * cite his work" — a direct answer to the patents asking for a citation —
   * scored on "work" and threw the visitor into the employment record.
   *
   * Patterns keep one veto: naming a record's full label outright is
   * unambiguous and beats inference. Below that the model wins, and patterns
   * only fill in when the model names nothing.
   */
  const namedOutright = d.namingScore >= 4;
  const fromModel =
    classification.target && !open.has(classification.target)
      ? classification.target
      : null;

  let targetId = d.target;
  if (!namedOutright && fromModel) targetId = fromModel;
  else if (!targetId && fromModel) targetId = fromModel;

  const target = targetId ? nodeById(targetId) ?? null : null;

  /**
   * A model reporting levers while also reporting that nothing concrete or
   * vague was offered has contradicted itself. Trust the narrower signal.
   */
  const modelLevers =
    classification.specificity === "none" ? [] : classification.levers;

  const offered = target
    ? Array.from(new Set([...patternLeverageFor(message, target), ...modelLevers]))
    : [];
  const allRecognised = Array.from(new Set([...d.tactics, ...modelLevers]));

  return applyPolicy({
    target,
    offered,
    allRecognised,
    specificity: classification.specificity,
    switched: Boolean(progress.k && targetId && targetId !== progress.k),
    intents: d.intents,
    progress,
  });
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
