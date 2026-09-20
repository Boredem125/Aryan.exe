"use client";

import { useState } from "react";
import { BootSequence } from "@/components/terminal/BootSequence";
import { Terminal } from "@/components/terminal/Terminal";

export default function Home() {
  const [entered, setEntered] = useState(false);

  if (entered) return <Terminal />;

  return (
    <main className="scanlines relative min-h-dvh bg-bg">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="bg-vignette absolute inset-0" aria-hidden />
      <div className="relative">
        <BootSequence onEnter={() => setEntered(true)} />
      </div>
    </main>
  );
}
