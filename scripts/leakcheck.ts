import { buildSystemPrompt } from "@/lib/llm/prompt";
import { EMPTY_PROGRESS, openRecords } from "@/lib/game/progress";
import { NODES } from "@/lib/game/nodes";
import { patents } from "@/lib/profile/patents";
import { contact } from "@/lib/profile/contact";
import { projects } from "@/lib/profile/projects";
import { experience } from "@/lib/profile/experience";

/* ============================================================
   LEAK CHECK

   The security claim is about what is placed in the model's
   context, so this tests the prompt payload — not the reply.
   A model can be talked into anything; a prompt that never
   contained the secret cannot give it up.

   Run: npm run leakcheck
   ============================================================ */

let failures = 0;

function absent(prompt: string, needles: string[], label: string) {
  const found = needles.filter((n) => n && prompt.includes(n));
  if (found.length) {
    failures++;
    console.log(`  FAIL  ${label}`);
    for (const f of found.slice(0, 4)) console.log(`          leaked: ${f.slice(0, 70)}`);
  } else console.log(`  pass  ${label}`);
}

function present(prompt: string, needle: string, label: string) {
  if (prompt.includes(needle)) console.log(`  pass  ${label}`);
  else {
    failures++;
    console.log(`  FAIL  ${label} — expected: ${needle.slice(0, 60)}`);
  }
}

const patentTitles = patents.map((p) => p.title);
const patentMetrics = patents.map((p) => p.metric ?? "").filter(Boolean);
const projectInternals = projects.flatMap((p) => [p.challenge, p.architecture]);
const uplHighlights = experience.find((e) => e.org === "UPL Limited")!.highlights;

const base = {
  intents: [] as never[],
  opened: [],
  target: null,
  accepted: [],
  rejected: [],
  stale: [],
  awaitingLeverage: false,
  shortBy: 0,
};

/* ---- nothing open ------------------------------------------- */
console.log("\n=== NOTHING OPEN ===");
{
  const prompt = buildSystemPrompt({
    ...base,
    progress: EMPTY_PROGRESS,
    target: "PATENTS",
    awaitingLeverage: true,
  });

  absent(prompt, patentTitles, "no patent titles");
  absent(prompt, patentMetrics, "no patent metrics");
  absent(prompt, [contact.email, contact.phone, contact.linkedin], "no contact details");
  absent(prompt, ["Aryan Hundia"], "no name");
  absent(prompt, ["Vellore Institute of Technology"], "no institution");
  absent(prompt, ["UPL Limited"], "no employer");
  absent(prompt, uplHighlights, "no employment detail");
  absent(prompt, projectInternals, "no project internals");
  absent(prompt, [`${patents.length} filings`], "patent count not stated");

  // The catalogue IS public — that is the design, so assert it is there.
  present(prompt, "CATALOGUE", "catalogue present");
  present(prompt, "Patent filings", "patents listed as existing");
}

/* ---- one unrelated record open ------------------------------ */
console.log("\n=== ONE RECORD OPEN (competition record) ===");
{
  const p = openRecords(EMPTY_PROGRESS, ["HACK"]);
  const prompt = buildSystemPrompt({ ...base, progress: p, opened: ["HACK"] });

  present(prompt, "Aryan Hundia", "name now disclosed");
  present(prompt, "FCRF National Cybercrime Hackathon", "opened record present");
  absent(prompt, patentTitles, "still no patent titles");
  absent(prompt, [contact.email, contact.phone], "still no contact details");
  absent(prompt, uplHighlights, "still no employment detail");
  absent(prompt, projectInternals, "still no project internals");
}

/* ---- everything open ---------------------------------------- */
console.log("\n=== EVERYTHING OPEN ===");
{
  const p = openRecords(EMPTY_PROGRESS, NODES.map((n) => n.id));
  const prompt = buildSystemPrompt({ ...base, progress: p });

  present(prompt, patents[0].title, "patent titles present");
  present(prompt, contact.email, "contact present");
  present(prompt, "MAXIMUM", "maximum access acknowledged");
}

console.log(
  failures === 0
    ? "\nLEAK CHECK PASSED — sealed content never enters the prompt.\n"
    : `\nLEAK CHECK FAILED — ${failures} problem(s).\n`,
);
process.exit(failures === 0 ? 0 : 1);
