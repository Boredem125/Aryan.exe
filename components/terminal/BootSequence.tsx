"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const FIELDS = [
  { key: "NAME", width: 14 },
  { key: "ROLE", width: 18 },
  { key: "LOCATION", width: 12 },
  { key: "PROJECTS", width: 16 },
  { key: "SECURITY", width: 20 },
  { key: "FILINGS", width: 10 },
];

const LINES = [
  "querying identity...",
  "resolving profile node...",
  "access level 00 assigned",
];

export function BootSequence({ onEnter }: { onEnter: () => void }) {
  const [step, setStep] = useState(0);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) {
      setStep(LINES.length + 1);
      return;
    }
    if (step > LINES.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 300 : 420);
    return () => clearTimeout(t);
  }, [step, reduced]);

  const done = step > LINES.length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 font-mono sm:py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
        ARYAN<span className="text-accent">.EXE</span>
      </h1>

      <div className="mt-6 space-y-1 text-sm text-text-faint" aria-live="polite">
        {LINES.slice(0, step).map((l) => (
          <p key={l}>
            <span className="text-accent-dim">&gt;</span> {l}
          </p>
        ))}
      </div>

      <dl className="mt-8 space-y-2 text-sm">
        {FIELDS.map((f, i) => (
          <div
            key={f.key}
            className="flex items-center gap-4 transition-opacity duration-500"
            style={{ opacity: done || step > i ? 1 : 0 }}
          >
            <dt className="w-24 shrink-0 text-text-faint">{f.key}</dt>
            <dd className="redacted h-4 flex-1" style={{ maxWidth: `${f.width * 10}px` }}>
              <span className="sr-only">redacted</span>
            </dd>
          </div>
        ))}
      </dl>

      <div
        className="mt-10 transition-opacity duration-700"
        style={{ opacity: done ? 1 : 0 }}
      >
        <p className="text-sm leading-relaxed text-text-dim">
          The information exists.
          <br />
          Your job is to find it.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onEnter}
            className="group border border-accent-dim bg-accent-glow px-5 py-3 text-left text-sm text-accent transition-colors hover:border-accent hover:bg-accent/10"
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

        <p className="mt-6 text-xs text-text-faint">
          In a hurry? The second door is a conventional CV. No puzzle.
        </p>
      </div>
    </div>
  );
}
