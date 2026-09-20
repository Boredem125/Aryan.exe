import type { Metadata } from "next";
import Link from "next/link";
import {
  identity,
  education,
  experience,
  projects,
  cyberDomains,
  achievements,
  leadership,
  skillGroups,
  certifications,
  contact,
} from "@/lib/profile";

/* ============================================================
   ./normal-portfolio

   A server-rendered, indexable, conventional CV. No puzzle, no
   terminal, no gate. A recruiter with ninety seconds should get
   everything that matters here.

   Note: the patent vault is deliberately NOT rendered on this page.
   It is the puzzle's endgame, so it stays behind the terminal — a
   redacted pointer below tells a reader it exists. Because this is
   a server component, none of that data reaches the browser.
   ============================================================ */

export const metadata: Metadata = {
  title: "Aryan Hundia — Computer & Information Security",
  description:
    "AI Security and GRC-focused Computer Science student at VIT Vellore. Production LLM security work at UPL Limited, national hackathon wins, and hardware-security research.",
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line py-12">
      <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {title}
      </h2>
      {children}
    </section>
  );
}

const NAV = [
  ["about", "About"],
  ["education", "Education"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["security", "Security"],
  ["achievements", "Achievements"],
  ["leadership", "Leadership"],
  ["skills", "Skills"],
  ["contact", "Contact"],
] as const;

export default function Portfolio() {
  return (
    <main className="min-h-dvh bg-bg">
      {/* Nav ------------------------------------------------- */}
      <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-3xl items-center gap-4 px-5 py-3">
          <Link href="/" className="font-mono text-sm font-semibold text-text">
            ARYAN<span className="text-accent">.EXE</span>
          </Link>
          <ul className="ml-auto hidden gap-4 md:flex">
            {NAV.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="font-mono text-[11px] text-text-faint transition-colors hover:text-accent"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/"
            className="ml-auto shrink-0 whitespace-nowrap border border-line px-2.5 py-1 font-mono text-[11px] text-text-dim transition-colors hover:border-accent-dim hover:text-accent md:ml-4"
          >
            ← terminal
          </Link>
        </nav>
      </header>

      <div className="mx-auto w-full max-w-3xl px-5 pb-24">
        {/* Hero ---------------------------------------------- */}
        <section id="about" className="scroll-mt-20 py-14">
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {identity.name}
          </h1>
          <p className="mt-2 font-mono text-sm text-accent">{identity.title}</p>
          <p className="mt-1 font-mono text-xs text-text-faint">{identity.location}</p>

          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-text-dim">
            {identity.summary}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {identity.focusAreas.map((f) => (
              <li
                key={f}
                className="border border-line-bright px-2.5 py-1 font-mono text-[11px] text-text-dim"
              >
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={contact.cv}
              className="border border-accent-dim bg-accent-glow px-4 py-2 font-mono text-xs text-accent transition-colors hover:border-accent"
            >
              Download CV ↓
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="border border-line px-4 py-2 font-mono text-xs text-text-dim transition-colors hover:border-line-bright hover:text-text"
            >
              {contact.email}
            </a>
          </div>
        </section>

        {/* Education ----------------------------------------- */}
        <Section id="education" title="Education">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-medium text-text">{education.institution}</h3>
            <span className="font-mono text-xs text-text-faint">
              {education.start} – {education.end}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-dim">
            {education.degree}, {education.field} · CGPA {education.cgpa}
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-text-faint">
            Coursework
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {education.coursework.map((c) => (
              <li
                key={c}
                className="border border-line px-2 py-0.5 font-mono text-[11px] text-text-dim"
              >
                {c}
              </li>
            ))}
          </ul>
        </Section>

        {/* Experience ---------------------------------------- */}
        <Section id="experience" title="Experience">
          <div className="space-y-9">
            {experience.map((e) => (
              <article key={`${e.org}-${e.role}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-medium text-text">
                    {e.org}
                    {e.orgNote ? (
                      <span className="ml-2 font-mono text-[11px] text-accent">
                        {e.orgNote}
                      </span>
                    ) : null}
                  </h3>
                  <span className="font-mono text-xs text-text-faint">
                    {e.start} – {e.end}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-accent-dim">{e.role}</p>
                <ul className="mt-3 space-y-2">
                  {e.highlights.map((h, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-text-dim">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-dim" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        {/* Projects ------------------------------------------ */}
        <Section id="projects" title="Projects">
          <div className="space-y-8">
            {projects.map((p) => (
              <article key={p.id} className="border border-line bg-surface p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-mono text-sm font-semibold text-accent">{p.name}</h3>
                  {p.repo ? (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-text-faint transition-colors hover:text-accent"
                    >
                      repository →
                    </a>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-text-dim">{p.tagline}</p>

                <dl className="mt-4 space-y-3">
                  {[
                    ["Problem", p.problem],
                    ["Solution", p.solution],
                    ["Hardest part", p.challenge],
                    ["Outcome", p.outcome],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[10px] uppercase tracking-widest text-text-faint">
                        {k}
                      </dt>
                      <dd className="mt-0.5 text-sm leading-relaxed text-text">{v}</dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <li
                      key={s}
                      className="border border-line-bright px-2 py-0.5 font-mono text-[11px] text-text-dim"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        {/* Security ------------------------------------------ */}
        <Section id="security" title="Cybersecurity">
          <div className="grid gap-6 sm:grid-cols-2">
            {cyberDomains.map((d) => (
              <div key={d.id}>
                <h3 className="font-mono text-sm text-text">{d.label}</h3>
                <p className="mt-1 font-mono text-[11px] text-accent-dim">// {d.log}</p>
                <ul className="mt-2 space-y-1.5">
                  {d.items.map((it, i) => (
                    <li key={i} className="text-sm leading-relaxed text-text-dim">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Achievements -------------------------------------- */}
        <Section id="achievements" title="Hackathons & Recognition">
          <ul className="space-y-3">
            {achievements.map((a, i) => (
              <li key={i} className="flex gap-4">
                <span className="w-14 shrink-0 font-mono text-sm text-accent">{a.place}</span>
                <span className="text-sm leading-relaxed text-text">
                  {a.event}
                  {a.detail ? (
                    <span className="text-text-dim"> · {a.detail}</span>
                  ) : null}
                  {a.venue ? (
                    <span className="block font-mono text-[11px] text-text-faint">
                      {a.venue}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Leadership ---------------------------------------- */}
        <Section id="leadership" title="Leadership">
          <div className="space-y-7">
            {leadership.map((l) => (
              <article key={`${l.org}-${l.role}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-medium text-text">{l.role}</h3>
                  <span className="font-mono text-xs text-text-faint">
                    {l.start} – {l.end}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-accent-dim">{l.org}</p>
                <ul className="mt-2 space-y-1.5">
                  {l.highlights.map((h, i) => (
                    <li key={i} className="text-sm leading-relaxed text-text-dim">
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        {/* Skills -------------------------------------------- */}
        <Section id="skills" title="Technical Skills">
          <div className="space-y-5">
            {skillGroups.map((g) => (
              <div key={g.label}>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-text-faint">
                  {g.label}
                </h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {g.skills.map((s) => (
                    <li
                      key={s}
                      className="border border-line px-2 py-0.5 font-mono text-[11px] text-text-dim"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="mt-8 font-mono text-[11px] uppercase tracking-widest text-text-faint">
            Certifications
          </h3>
          <ul className="mt-2 space-y-1.5">
            {certifications.map((c) => (
              <li key={c.name} className="text-sm text-text-dim">
                {c.name} — <span className="text-text-faint">{c.issuer}</span>
                {c.status === "ongoing" ? (
                  <span className="ml-2 font-mono text-[10px] text-amber">IN PROGRESS</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>

        {/* The one thing this page will not show -------------- */}
        <Section id="research" title="Research">
          <div className="border border-amber-dim bg-amber/5 p-5">
            <p className="font-mono text-sm text-amber">PATENT FILINGS — RESTRICTED</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-dim">
              Hardware-security research across AI security, digital forensics, malware
              analysis and web application security. Titles and results are not published
              on this page.
            </p>
            <p className="mt-3 font-mono text-sm tracking-widest text-text-faint">
              ██ FILINGS · ██ DOMAINS
            </p>
            <Link
              href="/"
              className="mt-4 inline-block border border-amber-dim px-3 py-1.5 font-mono text-xs text-amber transition-colors hover:border-amber"
            >
              Unlock in the terminal →
            </Link>
          </div>
        </Section>

        {/* Contact ------------------------------------------- */}
        <Section id="contact" title="Contact">
          <ul className="space-y-2 font-mono text-sm">
            <li>
              <span className="inline-block w-20 text-text-faint">email</span>
              <a href={`mailto:${contact.email}`} className="text-accent hover:underline">
                {contact.email}
              </a>
            </li>
            <li>
              <span className="inline-block w-20 text-text-faint">phone</span>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-text-dim">
                {contact.phone}
              </a>
            </li>
            <li>
              <span className="inline-block w-20 text-text-faint">linkedin</span>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                /in/aryanhundia
              </a>
            </li>
            <li>
              <span className="inline-block w-20 text-text-faint">github</span>
              <a
                href={contact.github}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                @{contact.githubUser}
              </a>
            </li>
          </ul>

          <p className="mt-10 border-t border-line pt-6 text-sm text-text-faint">
            Some portfolios tell you who someone is.{" "}
            <Link href="/" className="text-accent hover:underline">
              This one makes you find out.
            </Link>
          </p>
        </Section>
      </div>
    </main>
  );
}
