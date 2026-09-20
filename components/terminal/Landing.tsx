"use client";

import { useState } from "react";
import { BootSequence, type CatalogueRow } from "./BootSequence";
import { Terminal } from "./Terminal";

export function Landing({ rows }: { rows: CatalogueRow[] }) {
  const [entered, setEntered] = useState(false);
  const [target, setTarget] = useState<string | undefined>();

  if (entered) return <Terminal rows={rows} initialTarget={target} />;

  return (
    <main className="scanlines relative min-h-dvh bg-bg">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="bg-vignette absolute inset-0" aria-hidden />
      <div className="relative">
        <BootSequence
          rows={rows}
          onEnter={(t) => {
            setTarget(t);
            setEntered(true);
          }}
        />
      </div>
    </main>
  );
}
