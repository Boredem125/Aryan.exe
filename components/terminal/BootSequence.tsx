"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface CatalogueRow {
  id: string;
  label: string;
  summary: string;
  count: string;
}

const LINES = [
  "querying identity...",
  "resolving profile node...",
  "catalogue published // contents sealed",
];

export function BootSequence({
  rows,
  onEnter,
}: {
  rows: CatalogueRow[];
  onEnter: (target?: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  useEffect(() => {
    if (reduced) {
      setStep(LINES.length + 1);
      return;
    }
    if (step > LINES.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 260 : 380);
    return () => clearTimeout(t);
  }, [step, reduced]);

  const done = step > LINES.length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 font-mono sm:py-20">
      <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
        ARYAN<span className="text-red">.</span><span className="text-accent">EXE</span>
      </h1>

      <div className="mt-5 space-y-1 text-sm text-text-faint" aria-live="polite">
        {LINES.slice(0, step).map((l) => (
          <p key={l}>
            <span className="text-accent-dim">&gt;</span> {l}
          </p>
        ))}
      </div>

      {/* The catalogue is public on purpose. Anyone who came for one
          specific thing should see it immediately and go straight at it. */}
      <div
        className="mt-8 transition-opacity duration-500"
        style={{ opacity: done ? 1 : 0 }}
      >
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-text-faint">
          Available records
        </p>

        <ul className="divide-y divide-line border-y border-line">
          {rows.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onEnter(r.id)}
                className="group flex w-full items-baseline gap-3 px-1 py-2.5 text-left transition-colors hover:bg-surface"
              >
                <span className="sealed-pulse shrink-0 text-[10px] font-semibold tracking-wider text-red">
                  SEALED
                </span>
                <span className="flex min-w-0 flex-1 items-baseline gap-2 text-sm text-text group-hover:text-accent">
                  <span className="shrink-0">{r.label}</span>
                  <span className="hidden min-w-0 truncate text-xs text-text-faint sm:inline">
                    {r.summary}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-text-faint">{r.count}</span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm leading-relaxed text-text-dim">
          You can see what exists. You cannot see what is in it.
          <br />
          Pick one, and give me a reason worth something.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onEnter()}
            className="border border-accent-dim bg-accent-glow px-5 py-3 text-left text-sm text-accent transition-colors hover:border-accent hover:bg-accent/10"
          >
            [ ENTER THE SYSTEM ]
          </button>

          <Link
            href="/portfolio"
            className="border border-line px-5 py-3 text-left text-sm text-text-dim transition-colors hover:border-line-bright hover:text-text"
          >
            [ VIEW NORMAL PORTFOLIO ]
          </Link>
        </div>

        <p className="mt-5 text-xs text-text-faint">
          In a hurry? The second door is a conventional CV. No puzzle.
        </p>
      </div>
    </div>
  );
}
