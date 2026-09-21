"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AskResponse, Panel, ProgressSummary } from "@/types/api";
import { NodePanel } from "@/components/vault/NodePanel";
import type { CatalogueRow } from "./BootSequence";

const STORAGE_KEY = "aryanexe.progress";
const IDLE_MS = 25_000;

type Role = "user" | "ai" | "system";

interface Message {
  id: number;
  role: Role;
  text: string;
  panels?: Panel[];
  /** Characters revealed so far; -1 means fully shown. */
  reveal: number;
}

/**
 * Progress persists in localStorage, so a visitor can arrive mid-game with
 * records already open and levers already spent. Without saying so, the
 * system later tells them "you already spent X" about something they have
 * no memory of doing, which reads as a bug rather than a rule.
 */
function greeting(rows: CatalogueRow[], summary?: ProgressSummary | null) {
  const open = new Set(summary?.nodes ?? []);
  const spent = summary?.usedLabels ?? [];
  const resuming = open.size > 0 || spent.length > 0;

  const list = rows
    .map(
      (r) =>
        `  ${open.has(r.id) ? "[OPEN]  " : "[SEALED]"} ${r.label.padEnd(24)} ${r.count}`,
    )
    .join("\n");

  const header = resuming
    ? [
        `SESSION RESUMED — ${open.size}/${rows.length} records already open.`,
        spent.length
          ? `Levers already spent: ${spent.join(", ")}. Those will not work again.`
          : "",
        "Type reset to wipe this and start clean.",
      ]
        .filter(Boolean)
        .join("\n")
    : "PORTFOLIO INTELLIGENCE SYSTEM — ONLINE";

  return `${header}

I hold ${rows.length} records. You can see the labels. You cannot see inside.

${list}

Name the one you want, and tell me why you want it.
A reason with something at stake works. Curiosity does not.`;
}

/* localStorage throws in private mode and can return empty with site data
   blocked. Every access is guarded; without it you simply start over. */
const loadToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};
const saveToken = (t: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* progress will not persist */
  }
};
const clearToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
};

export function Terminal({
  rows,
  initialTarget,
}: {
  rows: CatalogueRow[];
  initialTarget?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [nudged, setNudged] = useState(false);
  /** True when the visitor has scrolled up and we should stop following. */
  const [pinned, setPinned] = useState(false);

  const nextId = useRef(1);
  /* `busy` is state, so two sends dispatched in the same tick (Enter
     keydown plus implicit form submit) would both read false and both
     fire. A ref settles it synchronously. */
  const sending = useRef(false);
  const booted = useRef(false);
  const followRef = useRef(true);
  const history = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useRef(false);

  const push = useCallback((m: Omit<Message, "id">) => {
    setMessages((ms) => [...ms, { ...m, id: nextId.current++ }]);
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sending.current) return;

      const lower = text.toLowerCase();
      if (lower === "clear") {
        setMessages([]);
        setInput("");
        return;
      }
      if (lower === "reset") {
        clearToken();
        setToken("");
        setMessages([
          { id: nextId.current++, role: "system", text: greeting(rows), reveal: -1 },
        ]);
        setInput("");
        fetch("/api/ask?token=")
          .then((r) => r.json())
          .then((d: { summary: ProgressSummary }) => setSummary(d.summary))
          .catch(() => {});
        return;
      }
      if (lower === "portfolio") {
        window.location.href = "/portfolio";
        return;
      }

      sending.current = true;
      followRef.current = true;
      setPinned(false);
      history.current.unshift(text);
      histIdx.current = -1;
      push({ role: "user", text, reveal: -1 });
      setInput("");
      setBusy(true);
      setNudged(false);

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            token,
            history: messages
              .filter((m) => m.role !== "system")
              .slice(-6)
              .map((m) => ({
                role: m.role === "ai" ? "assistant" : "user",
                content: m.text,
              })),
          }),
        });

        const data = (await res.json()) as AskResponse;

        if (data.token) {
          setToken(data.token);
          saveToken(data.token);
        }
        if (data.summary) setSummary(data.summary);

        push({
          role: data.source === "system" || data.source === "throttle" ? "system" : "ai",
          text: data.reply ?? "",
          panels: data.panels,
          reveal: data.reply && data.source !== "system" ? 0 : -1,
        });
      } catch {
        push({
          role: "system",
          text: "CONNECTION FAULT. The link dropped. Try again.",
          reveal: -1,
        });
      } finally {
        sending.current = false;
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [messages, push, rows, token],
  );

  /* Boot: restore progress, greet, and if the visitor clicked a record on
     the way in, open that negotiation immediately. */
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    // The button that mounted this took focus with it — a terminal you
    // must click before typing is a broken terminal.
    inputRef.current?.focus();
    reduced.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const t = loadToken();
    setToken(t);

    fetch(`/api/ask?token=${encodeURIComponent(t)}`)
      .then((r) => r.json())
      .then((d: { summary: ProgressSummary; token: string }) => {
        setSummary(d.summary);
        setToken(d.token);
        setMessages([
          {
            id: nextId.current++,
            role: "system",
            text: greeting(rows, d.summary),
            reveal: -1,
          },
        ]);
        if (initialTarget) {
          const row = rows.find((r) => r.id === initialTarget);
          if (row) setTimeout(() => void send(`show me the ${row.label}`), 250);
        }
      })
      .catch(() => {
        setMessages([
          { id: nextId.current++, role: "system", text: greeting(rows), reveal: -1 },
        ]);
      });
    // Intentionally once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Follow new output, but only while the visitor is already at the bottom.
     This effect runs on every render — including every typewriter tick —
     so forcing scrollTop unconditionally made it impossible to read back
     through the transcript: any attempt to scroll up was yanked down again
     a few milliseconds later. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el && followRef.current) el.scrollTop = el.scrollHeight;
  });

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 60;
    followRef.current = atBottom;
    setPinned(!atBottom);
  };

  const jumpToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    followRef.current = true;
    setPinned(false);
    el.scrollTop = el.scrollHeight;
  };

  /* Typewriter, skipped entirely under prefers-reduced-motion. */
  useEffect(() => {
    const msg = messages.find((m) => m.reveal >= 0);
    if (!msg) return;

    if (reduced.current || msg.reveal >= msg.text.length) {
      setMessages((ms) => ms.map((m) => (m.id === msg.id ? { ...m, reveal: -1 } : m)));
      return;
    }

    const timer = setTimeout(() => {
      setMessages((ms) =>
        ms.map((m) =>
          m.id === msg.id ? { ...m, reveal: Math.min(m.reveal + 3, m.text.length) } : m,
        ),
      );
    }, 12);
    return () => clearTimeout(timer);
  }, [messages]);

  /* Idle nudge — nobody should sit staring at a blinking cursor. */
  useEffect(() => {
    if (busy || nudged || messages.length < 2) return;
    const t = setTimeout(() => {
      setNudged(true);
      push({
        role: "system",
        text: "Still there? Type hint and I will tell you what the record wants.",
        reveal: -1,
      });
    }, IDLE_MS);
    return () => clearTimeout(t);
  }, [busy, nudged, messages, push]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Explicit rather than implicit form submission — mobile keyboards
    // vary in what their "Go" key does.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx.current < history.current.length - 1) {
        histIdx.current++;
        setInput(history.current[histIdx.current] ?? "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx.current > 0) {
        histIdx.current--;
        setInput(history.current[histIdx.current] ?? "");
      } else {
        histIdx.current = -1;
        setInput("");
      }
    }
  };

  const total = summary?.total ?? rows.length;
  const pct = summary ? (summary.count / total) * 100 : 0;
  const targetRow = summary?.target ? rows.find((r) => r.id === summary.target) : null;

  return (
    <div className="flex h-dvh flex-col bg-bg">
      <header className="shrink-0 border-b border-line bg-surface/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-2.5">
          <Link href="/" className="font-mono text-sm font-semibold text-text">
            ARYAN<span className="text-accent">.EXE</span>
          </Link>

          {targetRow ? (
            <span className="hidden font-mono text-[11px] text-amber sm:inline">
              ▸ {targetRow.label}
            </span>
          ) : null}

          <div className="ml-auto flex items-center gap-3 font-mono text-[11px] text-text-faint">
            <span>
              LVL <span className="text-accent">{summary?.levelCode ?? "00"}</span>/04
            </span>
            <span className="hidden sm:inline">
              OPEN <span className="text-accent">{summary?.count ?? 0}</span>/{total}
            </span>
            <div
              className="h-1 w-16 overflow-hidden bg-line"
              role="progressbar"
              aria-valuenow={summary?.count ?? 0}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-label="Records opened"
            >
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <Link
              href="/portfolio"
              className="whitespace-nowrap border border-line px-2 py-1 transition-colors hover:border-line-bright hover:text-text-dim"
            >
              skip →
            </Link>
          </div>
        </div>
      </header>

      <div ref={scrollRef} onScroll={onScroll} className="relative flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6" aria-live="polite">
          {messages.map((m) => {
            const shown = m.reveal >= 0 ? m.text.slice(0, m.reveal) : m.text;
            return (
              <div key={m.id} className="mb-5">
                {m.role === "user" ? (
                  <p className="font-mono text-sm text-text-dim">
                    <span className="text-accent">&gt;</span> {m.text}
                  </p>
                ) : (
                  <div
                    className={`whitespace-pre-wrap font-mono text-sm leading-relaxed ${
                      m.role === "system" ? "text-text-faint" : "text-text"
                    } ${m.reveal >= 0 ? "caret" : ""}`}
                  >
                    {shown}
                  </div>
                )}
                {m.panels?.map((p) => (
                  <NodePanel key={p.id} panel={p} />
                ))}
              </div>
            );
          })}

          {busy ? (
            <p className="font-mono text-sm text-text-faint">
              <span className="text-accent-dim">···</span> thinking
            </p>
          ) : null}
        </div>
      </div>

      {pinned ? (
        <div className="pointer-events-none relative z-10">
          <button
            type="button"
            onClick={jumpToBottom}
            className="pointer-events-auto absolute bottom-3 left-1/2 -translate-x-1/2 border border-line-bright bg-surface px-3 py-1.5 font-mono text-[11px] text-text-dim shadow-lg transition-colors hover:border-accent hover:text-accent"
          >
            ↓ jump to latest
          </button>
        </div>
      ) : null}

      <div className="shrink-0 border-t border-line bg-surface/60 backdrop-blur">
        <form
          className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <span aria-hidden className="font-mono text-sm text-accent">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            aria-label="Ask the system"
            placeholder={busy ? "" : "name a record, and a reason"}
            className="flex-1 bg-transparent font-mono text-sm text-text outline-none placeholder:text-text-faint disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="font-mono text-xs text-text-faint transition-colors hover:text-accent disabled:opacity-30"
          >
            send
          </button>
        </form>
      </div>
    </div>
  );
}
