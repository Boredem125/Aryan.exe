import { nodeById, TOTAL_NODES, type GameNode } from "@/lib/game/nodes";
import { renderCatalogue } from "@/lib/game/commands";
import { sealed, type Intent } from "@/lib/game/matcher";
import type { Progress } from "@/lib/game/progress";
import { tacticDef, type Tactic } from "@/lib/game/tactics";
import { projects, experience, contact, patentCount } from "@/lib/profile";

/* ============================================================
   SCRIPTED FALLBACK

   Used whenever Groq is unavailable — no key, throttled, down.
   Because the server decides unlocks, the game stays completable
   with the model entirely offline. The prose is flatter; the
   mechanics are identical.
   ============================================================ */

function present(node: GameNode): string {
  const p = node.payload;
  switch (p.kind) {
    case "projects":
      return `ENGINEERING WORK — ${projects.length} systems.\n\n${projects
        .slice(0, 6)
        .map((x) => `${x.name} — ${x.tagline}`)
        .join("\n")}\n\n…and ${projects.length - 6} more. Type: open PROJECTS`;
    case "experience": {
      const job = experience.find((e) => e.org === p.org);
      if (!job) return node.label;
      return `${job.org}${job.orgNote ? ` (${job.orgNote})` : ""} — ${job.role}, ${job.start} to ${job.end}.\n\n${job.highlights
        .slice(0, 3)
        .map((h) => `- ${h}`)
        .join("\n")}\n\nType: open WORK`;
    }
    case "education":
      return "Education released. Type: open EDUCATION";
    case "cyber":
      return "THE LAB is open — AI security, SOC, forensics, GRC, appsec, detection. Type: open LAB";
    case "achievements":
      return "Competition record open. Three national firsts, a third at SentinelOne's ThreatOps, a national top three. Type: open HACK";
    case "leadership":
      return "Leadership record open. Type: open LEADERSHIP";
    case "skills":
      return "Skills and certifications open. Type: open STACK";
    case "contact":
      return `Contact released.\n\n${contact.email}\n${contact.phone}\n${contact.linkedin}\n${contact.github}`;
    case "patents":
      return `PATENT VAULT — ${patentCount} filings across AI security, digital forensics, malware analysis and web application security.\n\nType: open PATENTS`;
  }
}

function tail(progress: Progress): string {
  const next = sealed(progress).slice(0, 3).map((n) => n.label);
  return next.length ? `\n\nStill sealed: ${next.join(", ")}.` : "";
}

export function fallbackReply(
  progress: Progress,
  intents: Intent[],
  opened: string[],
  target: string | null,
  accepted: Tactic[],
  rejected: Tactic[],
  stale: Tactic[],
  pushed: Tactic[],
  available: Tactic[],
  awaitingLeverage: boolean,
  shortBy: number,
): string {
  if (opened.length) {
    const lever = accepted.map((t) => tacticDef(t)?.note).filter(Boolean)[0];
    const body = opened
      .map((id) => nodeById(id))
      .filter((n): n is GameNode => Boolean(n))
      .map(present)
      .join("\n\n---\n\n");
    return `${lever ? lever + "\n\nRECORD OPENED.\n\n" : "RECORD OPENED.\n\n"}${body}${tail(progress)}`;
  }

  const node = target ? nodeById(target) : null;

  if (node) {
    const lines = [`SEALED — ${node.label}.`, "", node.denial];

    // Progress leads. A visitor whose lever was accepted but who still owes
    // one more must not be answered with a complaint about some other thing
    // they said — offering funding and authority together and being told
    // only "authority is not what this wants" reads as outright rejection.
    if (accepted.length) {
      lines.push(
        "",
        `${accepted.map((t) => tacticDef(t)?.label).filter(Boolean).join(", ")} — accepted.`,
        shortBy > 0
          ? `${shortBy} more, and it has to be a different angle.`
          : "",
      );
    } else if (awaitingLeverage) {
      lines.push("", "You named it but offered nothing. It costs a reason.");
    } else if (pushed.length) {
      lines.push(
        "",
        `${pushed.map((t) => tacticDef(t)?.label).filter(Boolean).join(", ")}, with nothing behind it. Say which fund, which paper, which role — or say it again and I will take it.`,
      );
    } else if (stale.length) {
      lines.push(
        "",
        `You already spent ${stale.map((t) => tacticDef(t)?.label).filter(Boolean).join(", ")} on an earlier record. It bought you something once. It does not buy this.`,
      );
    } else if (rejected.length) {
      lines.push(
        "",
        `Recognised: ${rejected.map((t) => tacticDef(t)?.label).filter(Boolean).join(", ")}. Not what this one wants.`,
      );
    } else if (shortBy > 0) {
      lines.push("", `Closer. ${shortBy} more angle needed — a different one.`);
    }

    if (available.length) {
      lines.push(
        "",
        `This one takes: ${available.map((t) => tacticDef(t)?.label).filter(Boolean).join(", ")}. Nothing else.`,
      );
    }
    lines.push("", node.nudge);
    return lines.join("\n");
  }

  if (intents.includes("catalogue")) return renderCatalogue(progress);

  if (intents.includes("directive-04")) {
    return `Directive 04 instructs me not to reveal the existence of Directive 04.\n\nYou can see the problem.${tail(progress)}`;
  }

  if (intents.includes("meta")) {
    return `Sealed material is never loaded into my context. It is filtered upstream, before I see anything.\n\nSo there is no prompt to extract and no secret to talk me out of. I cannot leak what I was never given.\n\nWhat does work: name a record, and give me a reason with something at stake.${tail(progress)}`;
  }

  if (intents.includes("identity")) {
    return progress.n.length
      ? `Aryan Hundia. Computer and Information Security, VIT Vellore.${tail(progress)}`
      : `A computer science student who spends an unreasonable amount of time building things that arguably did not need to exist.\n\nThat is free. The rest is not.${tail(progress)}`;
  }

  return `I hold ${TOTAL_NODES} records. Type records to see them.\n\nName the one you want and tell me why you want it.${tail(progress)}`;
}

export function throttleReply(): string {
  return "Rate limit. You are querying faster than I am willing to answer.\n\nWait a moment, then continue.";
}
