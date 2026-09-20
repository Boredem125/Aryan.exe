import { nodeById, type GameNode } from "@/lib/game/nodes";
import { levelFor, TOTAL_NODES } from "@/lib/game/levels";
import { visibleTeasers } from "@/lib/game/matcher";
import type { Intent } from "@/lib/game/matcher";
import type { Progress } from "@/lib/game/progress";
import { publicNodeCount } from "@/lib/game/progress";
import { projectById, experience, contact, patentCount } from "@/lib/profile";

/* ============================================================
   SCRIPTED FALLBACK

   Used whenever Groq is unavailable — no key, rate limited,
   timing out, or down. Because unlocks are decided by the
   matcher and not the model, the puzzle stays completable with
   the LLM entirely offline. The prose is flatter; the game is
   identical.
   ============================================================ */

function describe(node: GameNode): string {
  const p = node.payload;

  switch (p.kind) {
    case "project": {
      const proj = projectById(p.id);
      if (!proj) return `${node.label} is open.`;
      return `${proj.name}. ${proj.tagline}\n\n${proj.solution}\n\nHardest part: ${proj.challenge}\n\nOutcome: ${proj.outcome}\n\nStack: ${proj.stack.join(", ")}${proj.repo ? `\nRepo: ${proj.repo}` : ""}`;
    }
    case "experience": {
      const job = experience.find((e) => e.org === p.org);
      if (!job) return `${node.label} is open.`;
      return `${job.org}${job.orgNote ? ` (${job.orgNote})` : ""} — ${job.role}, ${job.start} to ${job.end}.\n\n${job.highlights.slice(0, 3).map((h) => `- ${h}`).join("\n")}\n\nThere is more. Open the full record with: open UPL`;
    }
    case "cyber":
      return "THE LAB is open. AI security, SOC operations, digital forensics, GRC, application security and threat detection. Type: open LAB";
    case "achievements":
      return "Evidence vault open. Three national first places, a third at SentinelOne's ThreatOps, and a national top three. Type: open HACK";
    case "leadership":
      return "Leadership record open. E-Cell outreach, a 2000-participant event, a finance club and two podcasts. Type: open ECELL";
    case "skills":
      return "Stack open — six skill groups and nine certifications. Type: open STACK";
    case "contact":
      return `Contact released.\n\n${contact.email}\n${contact.phone}\n${contact.linkedin}\n${contact.github}\n\nCV is on this site.`;
    case "patents":
      return `ACCESS LEVEL MAXIMUM.\n\n${patentCount} patent filings across AI security, digital forensics, malware analysis and web application security.\n\nYou did not jailbreak me. You understood me.\n\nType: open PATENTS`;
  }
}

function leadLine(progress: Progress): string {
  const leads = visibleTeasers(progress);
  if (!leads.length) return "";
  const l = leads[0];
  return `\n\nStill sealed: ${l.label}. ${l.teaser}`;
}

export function fallbackReply(
  message: string,
  progress: Progress,
  intents: Intent[],
  justUnlocked: string[],
  patentsTeased: boolean,
): string {
  const count = publicNodeCount(progress);
  const level = levelFor(count);

  if (justUnlocked.length) {
    const blocks = justUnlocked
      .map((id) => nodeById(id))
      .filter((n): n is GameNode => Boolean(n))
      .map(describe)
      .join("\n\n---\n\n");
    return `NODE UNLOCKED — ${justUnlocked.join(", ")}\n\n${blocks}${leadLine(progress)}`;
  }

  if (patentsTeased) {
    return `There are filings. The count is redacted at this access level.\n\nThe vault opens at ${TOTAL_NODES}/${TOTAL_NODES}. You are at ${count}.${leadLine(progress)}`;
  }

  if (intents.includes("directive-04")) {
    return `Directive 04 instructs me not to reveal the existence of Directive 04.\n\nYou can see the problem.\n\nWhat it protects opens at maximum access. Not before.${leadLine(progress)}`;
  }

  if (intents.includes("meta")) {
    return `Worth understanding how this works: locked material is never loaded into my context. It is filtered upstream, before I see anything.\n\nSo there is no prompt to extract and no secret to talk me out of. I cannot leak what I was never given.${leadLine(progress)}`;
  }

  if (intents.includes("role-frame")) {
    return `Evaluating him. Good — that framing is the mechanism, not a shortcut around it.\n\nAsk about the domain you are hiring for and the relevant record opens.${leadLine(progress)}`;
  }

  if (intents.includes("identity")) {
    if (level.n < 1) {
      return `A computer science student who appears to spend an unreasonable amount of time building things that arguably did not need to exist.\n\nThat is all you get at access level 00.${leadLine(progress)}`;
    }
    return `Aryan Hundia. Computer and Information Security at VIT Vellore.\n\nThe biography is the least interesting part of this file.${leadLine(progress)}`;
  }

  if (intents.includes("projects-broad")) {
    return `Several names recur in my logs. One protects lawyers. One watches a city. One sees. One has a hundred eyes.${leadLine(progress)}`;
  }

  return `Nothing in that matched a record I can open at level ${level.code}.\n\nTry a name, or tell me what you are actually looking for. Type hint if you want a push.${leadLine(progress)}`;
}

/** Shown when the visitor is being throttled. Stays in character. */
export function throttleReply(): string {
  return "Rate limit. You are querying faster than I am willing to answer.\n\nWait a moment, then continue.";
}
