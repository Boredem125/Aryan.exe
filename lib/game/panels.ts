import {
  projects,
  experience,
  education,
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
   directly, the whole profile — patents included — would ship in
   the JavaScript every visitor downloads, and the lock would be
   decoration you could defeat with devtools.

   So panels are built here and only for records the verified
   token actually contains.
   ============================================================ */

export interface PanelSection {
  label?: string;
  body?: string;
  items?: string[];
  tags?: string[];
  link?: { label: string; href: string };
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
    case "projects":
      return {
        id: node.id,
        label: "ENGINEERING WORK",
        kind: "projects",
        tagline: `${projects.length} shipped systems, with the hard parts left in.`,
        sections: projects.map((proj) => ({
          label: proj.name,
          body: `${proj.tagline}\n\n${proj.solution}\n\nHardest part: ${proj.challenge}\n\nOutcome: ${proj.outcome}`,
          tags: proj.stack,
          link: proj.repo ? { label: "repository", href: proj.repo } : undefined,
        })),
      };

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
          {
            label: "Elsewhere",
            items: experience
              .filter((e) => e.org !== p.org)
              .map((e) => `${e.role}, ${e.org} (${e.start} – ${e.end})`),
          },
        ],
      };
    }

    case "education":
      return {
        id: node.id,
        label: "EDUCATION",
        kind: "education",
        tagline: `${education.degree}, ${education.field} · CGPA ${education.cgpa}`,
        sections: [
          {
            label: education.institution,
            body: `${education.location} · ${education.start} – ${education.end}`,
          },
          { label: "Coursework", tags: education.coursework },
        ],
      };

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
        label: "COMPETITION RECORD",
        kind: "achievements",
        tagline: "Verified placements.",
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
        sections: leadership.map((l) => ({
          label: `${l.role}, ${l.org}`,
          body: `${l.start} – ${l.end}`,
          items: l.highlights,
        })),
      };

    case "skills":
      return {
        id: node.id,
        label: "SKILLS & CERTIFICATIONS",
        kind: "skills",
        tagline: "The tools. Less interesting than what was done with them.",
        sections: [
          ...skillGroups.map((g) => ({ label: g.label, tags: g.skills })),
          {
            label: "Certifications",
            items: certifications.map(
              (c) =>
                `${c.name} — ${c.issuer}${c.status === "ongoing" ? " (in progress)" : ""}`,
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
        tagline: `${patentCount} filings.`,
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
 * Panels for the given ids, but only for ids the verified progress
 * actually contains. An unearned id yields nothing, whoever asked.
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
