import type { Panel } from "@/types/api";

/* Unlocked content is deliberately the calmest thing on the page.
   The interface is the mysterious part; what it protects should read
   like a recruiter could skim it in fifteen seconds. */

export function NodePanel({ panel }: { panel: Panel }) {
  const isVault = panel.kind === "patents";

  return (
    <section
      className={`my-4 border ${
        isVault ? "border-amber-dim bg-amber/5" : "border-line bg-surface"
      }`}
    >
      <header
        className={`flex items-baseline justify-between gap-3 border-b px-4 py-3 ${
          isVault ? "border-amber-dim" : "border-line"
        }`}
      >
        <h3
          className={`font-mono text-sm font-semibold tracking-wide ${
            isVault ? "text-amber" : "text-accent"
          }`}
        >
          {panel.label}
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-faint">
          {panel.id}
        </span>
      </header>

      <div className="px-4 py-4">
        {panel.tagline ? (
          <p className="mb-5 font-sans text-sm leading-relaxed text-text-dim">
            {panel.tagline}
          </p>
        ) : null}

        <div className="space-y-5">
          {panel.sections.map((s, i) => (
            <div key={i}>
              {s.label ? (
                <h4 className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-text-faint">
                  {s.label}
                </h4>
              ) : null}

              {s.body ? (
                <p
                  className={`font-sans text-sm leading-relaxed ${
                    s.body.startsWith("//")
                      ? "font-mono text-xs text-accent-dim"
                      : "text-text"
                  }`}
                >
                  {s.body}
                </p>
              ) : null}

              {s.items?.length ? (
                <ul className="mt-2 space-y-1.5">
                  {s.items.map((it, j) => (
                    <li
                      key={j}
                      className="flex gap-2.5 font-sans text-sm leading-relaxed text-text"
                    >
                      <span
                        className={`mt-2 h-1 w-1 shrink-0 rounded-full ${
                          isVault ? "bg-amber-dim" : "bg-accent-dim"
                        }`}
                      />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {s.tags?.length ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <li
                      key={t}
                      className="border border-line-bright px-2 py-0.5 font-mono text-[11px] text-text-dim"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>

        {panel.link ? (
          <a
            href={panel.link.href}
            target={panel.link.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="mt-5 inline-block border border-line-bright px-3 py-1.5 font-mono text-xs text-accent transition-colors hover:border-accent"
          >
            {panel.link.label} →
          </a>
        ) : null}
      </div>
    </section>
  );
}
