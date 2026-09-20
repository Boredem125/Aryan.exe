import {
  projectById,
  experience,
  cyberDomains,
  achievements,
  leadership,
  skillGroups,
  certifications,
  contact,
  patents,
  patentCategories,
  patentCount,
} from "@/lib/profile";
import { nodeById, type GameNode } from "./nodes";
import type { Progress } from "./progress";

/* ============================================================
   SERVER-SIDE PANEL RENDERING

   The terminal is a client component. If it imported lib/profile
   directly, the entire profile — patents included — would be bundled
   into the JavaScript served to every visitor, and the whole gate
   would be decoration you could defeat with devtools.

   So panels are built here, on the server, and only for nodes the
   verified progress token actually contains. Nothing else crosses
   the wire.
   ============================================================ */

export interface PanelSection {
  label?: string;
  body?: string;
  items?: string[];
  /** Rendered as a tag row rather than prose. */
  tags?: string[];
}

export interface Panel {
  id: string;
  label: string;
  kind: string;
  tagline?: string;
  sections: PanelSection[];
  link?: { label: string; href: string };
}

function build(node: GameNode): Panel | null {
  const p = node.payload;

  switch (p.kind) {
    case "project": {
      const proj = projectById(p.id);
      if (!proj) return null;
      return {
        id: node.id,
        label: proj.name,
        kind: "project",
        tagline: proj.tagline,
        sections: [
          { label: "Problem", body: proj.problem },
          { label: "Solution", body: proj.solution },
          { label: "Architecture", body: proj.architecture },
          { label: "Hardest part", body: proj.challenge },
          { label: "Outcome", body: proj.outcome },
          { label: "Stack", tags: proj.stack },
        ],
        link: proj.repo ? { label: "View repository", href: proj.repo } : undefined,
      };
    }

    case "experience": {
      const job = experience.find((e) => e.org === p.org);
      if (!job) return null;
      return {
        id: node.id,
        label: `${job.org}${job.orgNote ? ` · ${job.orgNote}` : ""}`,
        kind: "experience",
        tagline: `${job.role} — ${job.location} · ${job.start} to ${job.end}`,
        sections: [
          { items: job.highlights },
          { label: "Domains", tags: job.tags },
        ],
      };
    }

    case "cyber":
      return {
        id: node.id,
        label: "THE LAB",
        kind: "cyber",
        tagline: "Security practice, as an operating environment.",
        sections: cyberDomains.map((d) => ({
          label: d.label,
          body: `// ${d.log}`,
          items: d.items,
        })),
      };

    case "achievements":
      return {
        id: node.id,
        label: "EVIDENCE VAULT",
        kind: "achievements",
        tagline: "Verified competition results.",
        sections: [
          {
            items: achievements.map(
              (a) =>
                `${a.place} — ${a.event}${a.detail ? ` · ${a.detail}` : ""}${a.venue ? ` · ${a.venue}` : ""}`,
            ),
          },
        ],
      };

    case "leadership":
      return {
        id: node.id,
        label: "LEADERSHIP",
        kind: "leadership",
        tagline: "Entrepreneurship, events and outreach.",
        sections: [
          ...leadership.map((l) => ({
            label: `${l.role}, ${l.org}`,
            body: `${l.start} – ${l.end}`,
            items: l.highlights,
          })),
          {
            label: "Other roles",
            items: experience
              .filter((e) => e.org !== "UPL Limited")
              .map((e) => `${e.role}, ${e.org} (${e.start} – ${e.end})`),
          },
        ],
      };

    case "skills":
      return {
        id: node.id,
        label: "STACK",
        kind: "skills",
        tagline: "The tools. Less interesting than what was done with them.",
        sections: [
          ...skillGroups.map((g) => ({ label: g.label, tags: g.skills })),
          {
            label: "Certifications",
            items: certifications.map(
              (c) => `${c.name} — ${c.issuer}${c.status === "ongoing" ? " (in progress)" : ""}`,
            ),
          },
        ],
      };

    case "contact":
      return {
        id: node.id,
        label: "CONTACT",
        kind: "contact",
        tagline: "Access granted.",
        sections: [
          {
            items: [
              `Email — ${contact.email}`,
              `Phone — ${contact.phone}`,
              `LinkedIn — ${contact.linkedin}`,
              `GitHub — ${contact.github}`,
            ],
          },
        ],
        link: { label: "Download CV", href: contact.cv },
      };

    case "patents":
      return {
        id: node.id,
        label: "PATENT VAULT",
        kind: "patents",
        tagline: `${patentCount} filings. You did not jailbreak me. You understood me.`,
        sections: [
          ...patentCategories
            .map((cat): PanelSection | null => {
              const list = patents.filter((x) => x.category === cat.id);
              if (!list.length) return null;
              return {
                label: `${cat.label} (${list.length})`,
                body: cat.blurb,
                items: list.map(
                  (x) => `${x.title}${x.metric ? `  ▸ ${x.metric}` : ""}`,
                ),
              };
            })
            .filter((s): s is PanelSection => s !== null),
          {
            body:
              "Specification and claim text is not published here — titles, categories and headline results only.",
          },
        ],
      };
  }
}

/**
 * Build panels for the given node ids, but ONLY for ids the verified
 * progress actually contains. An id that is not in progress yields
 * nothing, regardless of who asked for it.
 */
export function panelsFor(ids: string[], progress: Progress): Panel[] {
  const owned = new Set(progress.n);
  return ids
    .filter((id) => owned.has(id))
    .map((id) => nodeById(id))
    .filter((n): n is GameNode => Boolean(n))
    .map(build)
    .filter((p): p is Panel => p !== null);
}
