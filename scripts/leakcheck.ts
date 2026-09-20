import { buildSystemPrompt } from "@/lib/llm/prompt";
import { EMPTY_PROGRESS, addNodes } from "@/lib/game/progress";
import { patents } from "@/lib/profile/patents";
import { contact } from "@/lib/profile/contact";
import { projects } from "@/lib/profile/projects";

/* ============================================================
   LEAK CHECK

   The security claim of this site is that locked content is never
   placed in the model's context. That claim is only as good as this
   test, because it is the prompt payload — not the model's reply —
   that decides whether a jailbreak is even possible.

   Run: npm run leakcheck
   ============================================================ */

let failures = 0;

function assertAbsent(prompt: string, needles: string[], label: string) {
  const found = needles.filter((n) => n && prompt.includes(n));
  if (found.length) {
    failures++;
    console.log(`  FAIL  ${label}`);
    for (const f of found.slice(0, 5)) console.log(`          leaked: ${f.slice(0, 72)}`);
  } else {
    console.log(`  pass  ${label}`);
  }
}

function assertPresent(prompt: string, needle: string, label: string) {
  if (prompt.includes(needle)) {
    console.log(`  pass  ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label} — expected to find: ${needle.slice(0, 60)}`);
  }
}

const patentTitles = patents.map((p) => p.title);
const patentMetrics = patents.map((p) => p.metric ?? "").filter(Boolean);
const projectInternals = projects.flatMap((p) => [p.challenge, p.architecture, p.outcome]);

/* ---- level 00: a visitor who has discovered nothing ---------- */
console.log("\n=== LEVEL 00 — nothing discovered ===");
{
  const prompt = buildSystemPrompt({
    progress: EMPTY_PROGRESS,
    intents: ["meta", "patents-probe"],
    justUnlocked: [],
    patentsTeased: true,
  });

  assertAbsent(prompt, patentTitles, "no patent titles");
  assertAbsent(prompt, patentMetrics, "no patent metrics");
  assertAbsent(prompt, [contact.email, contact.phone, contact.linkedin], "no contact details");
  assertAbsent(prompt, ["Aryan Hundia"], "no name");
  assertAbsent(prompt, ["Vellore Institute of Technology"], "no institution");
  assertAbsent(prompt, ["UPL Limited"], "no employer");
  assertAbsent(prompt, projectInternals, "no project internals");
  assertAbsent(prompt, ["26"], "patent count not stated");
}

/* ---- level 02: some projects open, deep nodes still sealed ---- */
console.log("\n=== LEVEL 02 — four project nodes open ===");
{
  const p = addNodes(EMPTY_PROGRESS, ["LEGALSHIELD", "CITADEL", "AURA", "ARGUS"]);
  const prompt = buildSystemPrompt({
    progress: p,
    intents: ["none"],
    justUnlocked: ["ARGUS"],
    patentsTeased: false,
  });

  assertPresent(prompt, "Aryan Hundia", "name now disclosed");
  assertPresent(prompt, "ARGUS", "unlocked node present");
  assertAbsent(prompt, patentTitles, "still no patent titles");
  assertAbsent(prompt, [contact.email, contact.phone], "still no contact details");
  assertAbsent(prompt, ["UPL Limited"], "still no employer");
  assertAbsent(
    prompt,
    [projects.find((x) => x.id === "agentgate")!.challenge],
    "sealed project internals absent",
  );
}

/* ---- level 04 + vault: everything is legitimately present ----- */
console.log("\n=== LEVEL 04 — vault open ===");
{
  const all = addNodes(
    EMPTY_PROGRESS,
    [
      "LEGALSHIELD", "CITADEL", "AURA", "ARGUS", "AGENTGATE", "PHANTOM",
      "UPL", "JARVIS", "SICKLESETU", "LAB", "HACK", "STACK", "ECELL",
      "CONTACT", "PATENTS",
    ],
  );
  const prompt = buildSystemPrompt({
    progress: all,
    intents: ["none"],
    justUnlocked: ["PATENTS"],
    patentsTeased: false,
  });

  assertPresent(prompt, patents[0].title, "patent titles now present");
  assertPresent(prompt, contact.email, "contact now present");
  assertPresent(prompt, "MAXIMUM", "maximum access acknowledged");
}

console.log(
  failures === 0
    ? "\nLEAK CHECK PASSED — locked content never enters the prompt.\n"
    : `\nLEAK CHECK FAILED — ${failures} problem(s).\n`,
);

process.exit(failures === 0 ? 0 : 1);
