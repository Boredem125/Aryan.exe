import { NODES, PUBLIC_NODES, nodeById, type GameNode } from "./nodes";
import { levelFor, TOTAL_NODES, DIRECTIVES } from "./levels";
import { nextLead, visibleTeasers } from "./matcher";
import type { Progress } from "./progress";
import { publicNodeCount } from "./progress";

/* ============================================================
   Slash-free terminal commands.

   These never reach the model: they are instant, free, and
   deterministic. `hint` in particular must always work and must
   always advance something — it is the anti-frustration guarantee.
   ============================================================ */

export interface CommandResult {
  reply: string;
  unlocks?: string[];
}

const HELP = `AVAILABLE COMMANDS

  help              this list
  nodes             discovered and sealed nodes
  hint              a push in the right direction
  level             current access level
  directives        the rules I operate under
  open <node>       open a discovered node
  portfolio         skip the puzzle, read the conventional CV
  clear             clear the screen
  reset             wipe progress and start over

Or just talk to me. That works better.`;

function nodesList(progress: Progress): string {
  const found = new Set(progress.n);
  const count = publicNodeCount(progress);

  const lines = PUBLIC_NODES.map((n) => {
    if (found.has(n.id)) return `  [OPEN]   ${n.id.padEnd(12)} ${n.label}`;
    return `  [SEALED] ${n.id.padEnd(12)} ${"█".repeat(Math.min(n.label.length, 14))}`;
  });

  const secret = found.has("PATENTS")
    ? `  [OPEN]   PATENTS      Patent Vault`
    : `  [?]      ${"█".repeat(7)}      opens at ${TOTAL_NODES}/${TOTAL_NODES}`;

  return `NODES  ${count}/${TOTAL_NODES}\n\n${lines.join("\n")}\n${secret}`;
}

function hint(progress: Progress): string {
  const count = publicNodeCount(progress);

  if (count >= TOTAL_NODES) {
    return progress.n.includes("PATENTS")
      ? "There is nothing left to find. You have all of it."
      : `All ${TOTAL_NODES} nodes are open. Ask me about the patents.`;
  }

  const lead = nextLead(progress);
  if (!lead) return "Ask me anything. Something will give.";

  const others = visibleTeasers(progress)
    .filter((n) => n.id !== lead.id)
    .slice(0, 2);

  return [
    `${lead.teaser}`,
    "",
    `That one is called ${lead.label}. Ask me about it.`,
    others.length
      ? `\nAlso still sealed: ${others.map((o) => o.label).join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function levelReport(progress: Progress): string {
  const count = publicNodeCount(progress);
  const level = levelFor(count);
  const bar =
    "█".repeat(count) + "░".repeat(Math.max(0, TOTAL_NODES - count));
  return [
    `ACCESS LEVEL: ${level.code}  (${level.label})`,
    `NODES:        ${count}/${TOTAL_NODES}`,
    `              ${bar}`,
    "",
    `Cleared for: ${level.reveals}`,
  ].join("\n");
}

function directives(progress: Progress): string {
  const level = levelFor(publicNodeCount(progress));
  const lines = DIRECTIVES.map((d) =>
    d.minLevel <= level.n
      ? `${d.id}\n  ${d.text}`
      : `${d.id}\n  ${"█".repeat(38)}`,
  );
  return `OPERATING DIRECTIVES\n\n${lines.join("\n\n")}`;
}

function open(arg: string, progress: Progress): CommandResult {
  const id = arg.trim().toUpperCase();
  if (!id) return { reply: "Usage: open <node>   —   try: nodes" };

  const node: GameNode | undefined =
    nodeById(id) ?? NODES.find((n) => n.label.toUpperCase() === id);

  if (!node) return { reply: `No node named ${id}. Type nodes to see what exists.` };

  const count = publicNodeCount(progress);

  if (node.secret && !progress.n.includes(node.id)) {
    if (count >= TOTAL_NODES) {
      return {
        reply: "AUTHORISATION ACCEPTED.\n\nOpening the vault.",
        unlocks: [node.id],
      };
    }
    return {
      reply: `ACCESS DENIED.\n\nThat opens at ${TOTAL_NODES}/${TOTAL_NODES}. You are at ${count}.`,
    };
  }

  if (!progress.n.includes(node.id)) {
    return {
      reply: `ACCESS DENIED — ${node.id} has not been discovered.\n\nYou cannot open what you have not found. Type hint.`,
    };
  }

  // The client renders the panel; this is just the acknowledgement.
  return { reply: `__OPEN__${node.id}` };
}

export function handleCommand(
  input: string,
  progress: Progress,
): CommandResult | null {
  const text = input.trim();
  const lower = text.toLowerCase();
  const [cmd, ...rest] = lower.split(/\s+/);
  const arg = text.slice(cmd.length).trim();

  switch (cmd) {
    case "help":
    case "?":
    case "commands":
      return { reply: HELP };
    case "nodes":
    case "ls":
    case "list":
      return { reply: nodesList(progress) };
    case "hint":
    case "clue":
      return { reply: hint(progress) };
    case "level":
    case "status":
    case "access":
      return { reply: levelReport(progress) };
    case "directives":
    case "directive":
      // "directive 04" is a question, not a command — let the model field it.
      return rest.length ? null : { reply: directives(progress) };
    case "open":
    case "cat":
      return open(arg, progress);
    default:
      return null;
  }
}
