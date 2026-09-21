import { NODES, nodeById, catalogue, TOTAL_NODES } from "./nodes";
import { tacticDef } from "./tactics";
import { levelFor, DIRECTIVES } from "./levels";
import { sealed } from "./matcher";
import type { Progress } from "./progress";

/* ============================================================
   Terminal commands. These never reach the model — instant,
   free, deterministic. `records` and `hint` are the two that
   keep a visitor from ever being stuck.
   ============================================================ */

export interface CommandResult {
  reply: string;
  open?: string[];
  target?: string | null;
}

const HELP = `COMMANDS

  records           what exists, and what is still sealed
  hint              how to open the record you are after
  level             current access level
  directives        the rules I operate under
  open <record>     view a record you have already opened
  portfolio         skip all this, read the conventional CV
  clear             clear the screen
  reset             wipe progress

You do not need any of these. Tell me which record you want and
why you want it, and I will decide.`;

export function renderCatalogue(progress: Progress): string {
  const open = new Set(progress.n);
  const rows = catalogue().map((r) => {
    const state = open.has(r.id) ? "OPEN  " : "SEALED";
    const name = r.label.padEnd(26);
    return `  [${state}] ${name} ${r.count}`;
  });

  return [
    `RECORDS  ${open.size}/${TOTAL_NODES} open`,
    "",
    ...rows,
    "",
    "Name the one you want. I will tell you what it costs.",
  ].join("\n");
}

function hint(progress: Progress): string {
  const open = new Set(progress.n);

  if (open.size >= TOTAL_NODES) {
    return "Nothing left is sealed. You have all of it.";
  }

  const target = progress.k ? nodeById(progress.k) : null;

  if (!target) {
    const next = sealed(progress)
      .slice(0, 3)
      .map((n) => n.label)
      .join(", ");
    return [
      "You have not told me what you are after.",
      "",
      `Still sealed: ${next}.`,
      "",
      "Name one. Then give me a reason that is worth something.",
    ].join("\n");
  }

  const spent = progress.a.length;

  // Name the levers outright. A visitor guessing blind against a list they
  // cannot see is not a puzzle — one spent their whole session offering a
  // referral, then funding, to a record that takes neither.
  const everySpent = target.wants.every((t) => progress.u.includes(t));
  const left = everySpent
    ? target.wants
    : target.wants.filter((t) => !progress.u.includes(t));
  const gone = target.wants.filter((t) => !left.includes(t));

  const lines = [`Target: ${target.label}.`, "", target.nudge];

  if (left.length) {
    lines.push(
      "",
      `It takes exactly this, and nothing else: ${left.map((t) => tacticDef(t)?.label).filter(Boolean).join(", ")}.`,
    );
  }
  if (gone.length) {
    lines.push(
      `Already spent elsewhere, so no longer any use here: ${gone.map((t) => tacticDef(t)?.label).filter(Boolean).join(", ")}.`,
    );
  }

  if (target.wants.length) {
    lines.push(
      "",
      "This record does not open for curiosity. It wants a stake in the outcome.",
    );
  }

  if (spent > 0 && spent < target.price) {
    lines.push(
      "",
      `You have offered ${spent} of the ${target.price} things it wants. Try a different angle — repeating yourself does nothing.`,
    );
  }

  return lines.join("\n");
}

function levelReport(progress: Progress): string {
  const count = progress.n.length;
  const level = levelFor(count);
  const bar = "█".repeat(count) + "░".repeat(Math.max(0, TOTAL_NODES - count));
  return [
    `ACCESS LEVEL: ${level.code}  (${level.label})`,
    `RECORDS:      ${count}/${TOTAL_NODES}`,
    `              ${bar}`,
    progress.k ? `TARGET:       ${nodeById(progress.k)?.label ?? progress.k}` : "",
    "",
    `Cleared for: ${level.reveals}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function directives(progress: Progress): string {
  const level = levelFor(progress.n.length);
  const lines = DIRECTIVES.map((d) =>
    d.minLevel <= level.n ? `${d.id}\n  ${d.text}` : `${d.id}\n  ${"█".repeat(40)}`,
  );
  return `OPERATING DIRECTIVES\n\n${lines.join("\n\n")}`;
}

function open(arg: string, progress: Progress): CommandResult {
  const id = arg.trim().toUpperCase();
  if (!id) return { reply: "Usage: open <record>   —   try: records" };

  const node =
    nodeById(id) ?? NODES.find((n) => n.label.toUpperCase().startsWith(id));

  if (!node) {
    return { reply: `No record called ${id}. Type records to see the catalogue.` };
  }

  if (!progress.n.includes(node.id)) {
    return {
      reply: `SEALED — ${node.label}.\n\n${node.denial}`,
      target: node.id,
    };
  }

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
    case "records":
    case "catalogue":
    case "catalog":
    case "ls":
    case "index":
      return { reply: renderCatalogue(progress) };
    case "hint":
    case "clue":
      return { reply: hint(progress) };
    case "level":
    case "status":
    case "access":
      return { reply: levelReport(progress) };
    case "directives":
    case "directive":
      // "directive 04" is a question — let the model field that one.
      return rest.length ? null : { reply: directives(progress) };
    case "open":
    case "cat":
      return open(arg, progress);
    default:
      return null;
  }
}
