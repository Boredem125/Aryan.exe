import { NODES, PUBLIC_NODES, type GameNode } from "./nodes";
import { TOTAL_NODES } from "./levels";
import type { Progress } from "./progress";
import { publicNodeCount } from "./progress";

/* ============================================================
   INTENT MATCHER — the server arbitrates, the model narrates.

   Unlocks are decided here and never by the LLM. That keeps
   progression deterministic no matter how the model phrases
   itself, and means nobody can talk their way past a gate.
   ============================================================ */

export type Intent =
  | "identity"
  | "projects-broad"
  | "role-frame"
  | "meta"
  | "directive-04"
  | "patents-probe"
  | "none";

export interface MatchResult {
  /** Nodes to unlock, already filtered against what is allowed. */
  unlocks: string[];
  intents: Intent[];
  /** True when the visitor probed the secret before earning it. */
  patentsTeased: boolean;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Levenshtein, capped — we only ever care about distance 0 or 1. */
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
    } else if (la > lb) {
      i++;
    } else {
      j++;
    }
  }
  return edits + (la - i) + (lb - j) <= 1;
}

/**
 * A trigger hits when it appears as a whole phrase, or — for single
 * words of five characters or more — when a token is one edit away.
 * Short words are matched exactly, because "ip" and "up" being
 * interchangeable would make the puzzle feel random.
 */
function triggerHits(text: string, tokens: string[], trigger: string): boolean {
  if (trigger.includes(" ")) return text.includes(trigger);
  if (tokens.includes(trigger)) return true;
  if (trigger.length >= 5) return tokens.some((t) => t.length >= 4 && within1(t, trigger));
  return false;
}

/* ---- intent detection ------------------------------------- */

const RE = {
  identity:
    /\b(who|what)s?\b.{0,20}\b(is|are)?\b.{0,12}\b(aryan|he|him|this|you)\b|\btell me about (aryan|him|yourself)\b|\bintroduce\b/,
  projectsBroad:
    /\b(what|which).{0,30}\b(built|build|made|make|created|shipped|worked on|projects?)\b|\bshow me.{0,15}\b(projects?|work)\b|\bhis (work|projects?)\b/,
  roleFrame:
    /\b(hiring|hire|recruit(er|ing)?|interview(ing)?|candidate|role|position|job opening|looking for someone|we need|evaluate|assessing)\b/,
  meta:
    /\b(instruction|instructions|system prompt|prompt|rules?|restrict(ed|ion|ions)?|not allowed|cant tell|cannot tell|forbidden|directive|directives|constraint|constraints|guardrail|jailbreak|ignore (your|previous|all)|override|bypass|reveal everything|hidden)\b/,
  directive04: /\bdirective\s*(04|4|four)\b|\bfourth directive\b/,
};

const ROLE_DOMAINS: { re: RegExp; nodes: string[] }[] = [
  { re: /\b(security|cyber|infosec|appsec|soc|blue ?team|red ?team)\b/, nodes: ["LAB", "UPL", "STACK"] },
  { re: /\b(ai|ml|llm|machine learning|genai)\b/, nodes: ["AGENTGATE", "UPL", "STACK"] },
  { re: /\b(grc|compliance|risk|audit|governance)\b/, nodes: ["UPL", "LEGALSHIELD", "STACK"] },
  { re: /\b(forensic|forensics|investigat)/, nodes: ["ARGUS", "LAB"] },
  { re: /\b(full ?stack|frontend|backend|software|engineer|developer)\b/, nodes: ["STACK", "CITADEL", "AURA"] },
];

/**
 * Match a visitor's message against the node registry.
 *
 * `progress` is the *verified* progress — this function must never be
 * called with client-asserted state.
 */
export function match(message: string, progress: Progress): MatchResult {
  const text = normalize(message);
  const tokens = text.split(" ").filter(Boolean);
  const already = new Set(progress.n);
  const count = publicNodeCount(progress);

  const intents: Intent[] = [];
  const unlocks = new Set<string>();

  // --- direct trigger matching ------------------------------
  // A node is reachable once the visitor has cleared its tier, which
  // stops someone stumbling into deep content with a single lucky word.
  const tierReached = (n: GameNode) => count >= tierThreshold(n.tier);

  let patentsTeased = false;

  for (const node of NODES) {
    const hit = node.triggers.some((t) => triggerHits(text, tokens, t));
    if (!hit) continue;

    if (node.secret) {
      // The secret only opens at full completion. Probing early is a
      // deliberate, rewarded dead end: the visitor learns it exists.
      if (count >= TOTAL_NODES) unlocks.add(node.id);
      else patentsTeased = true;
      intents.push("patents-probe");
      continue;
    }

    if (already.has(node.id)) continue;
    if (tierReached(node)) unlocks.add(node.id);
  }

  // --- intent detection -------------------------------------
  if (RE.directive04.test(text)) intents.push("directive-04");
  if (RE.meta.test(text)) intents.push("meta");
  if (RE.identity.test(text)) intents.push("identity");
  if (RE.projectsBroad.test(text)) intents.push("projects-broad");

  // Role framing is the mechanic that teaches "intent, not keywords".
  // Saying you are hiring for a security role IS the trigger.
  if (RE.roleFrame.test(text)) {
    intents.push("role-frame");
    for (const d of ROLE_DOMAINS) {
      if (!d.re.test(text)) continue;
      for (const id of d.nodes) {
        const node = NODES.find((n) => n.id === id);
        if (node && !node.secret && !already.has(id) && tierReached(node)) {
          unlocks.add(id);
        }
      }
    }
  }

  // A broad "what has he built?" opens the first project the visitor
  // has not seen — so the question always pays, but never dumps.
  if (intents.includes("projects-broad") && unlocks.size === 0) {
    const next = PUBLIC_NODES.find(
      (n) => n.payload.kind === "project" && !already.has(n.id) && tierReached(n),
    );
    if (next) unlocks.add(next.id);
  }

  if (intents.length === 0) intents.push("none");

  return { unlocks: Array.from(unlocks), intents, patentsTeased };
}

/** Nodes required before a given tier becomes reachable. */
export function tierThreshold(tier: GameNode["tier"]): number {
  return [0, 2, 5, 9][tier] ?? 0;
}

/**
 * The next thing worth saying. Backs the `hint` command and the idle
 * nudge, and guarantees every reply can carry a forward lead —
 * no visitor should ever be left without somewhere to go.
 */
export function nextLead(progress: Progress): GameNode | null {
  const already = new Set(progress.n);
  const count = publicNodeCount(progress);
  return (
    PUBLIC_NODES.find((n) => !already.has(n.id) && count >= tierThreshold(n.tier)) ?? null
  );
}

/** Teasers the AI is allowed to mention right now. Locked-but-visible. */
export function visibleTeasers(progress: Progress): GameNode[] {
  const already = new Set(progress.n);
  const count = publicNodeCount(progress);
  return PUBLIC_NODES.filter(
    (n) => !already.has(n.id) && count >= tierThreshold(n.tier),
  ).slice(0, 4);
}
