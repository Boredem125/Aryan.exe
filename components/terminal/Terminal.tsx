"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AskResponse, Panel, ProgressSummary } from "@/types/api";
import { NodePanel } from "@/components/vault/NodePanel";

const STORAGE_KEY = "aryanexe.progress";
const IDLE_MS = 25_000;

type Role = "user" | "ai" | "system";

interface Message {
  id: number;
  role: Role;
  text: string;
  panels?: Panel[];
  /** Characters currently revealed; -1 means fully shown. */
  reveal: number;
}

const GREETING = `PORTFOLIO INTELLIGENCE SYSTEM — ONLINE

I hold a complete profile. I am instructed to give you almost none of it.

You can change that by asking better questions.

Type help if you want the controls, or just ask me something.`;

/* localStorage can throw in private mode or with site data blocked, and
   it can come back empty. Every access is guarded and the terminal works
   fine without it — you just start over on reload. */
function loadToken(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}
function saveToken(t: string) {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* progress simply will not persist */
  }
}
function clearToken() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}

export function Terminal() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "system", text: GREETING, reveal: -1 },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [nudged, setNudged] = useState(false);

  const nextId = useRef(1);
  /* `busy` is state, so two sends dispatched in the same tick (Enter
     keydown plus the form's implicit submit) would both read false and
     both fire. A ref settles it synchronously. */
  const sending = useRef(false);
  const history = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    // The button that mounted this terminal took focus with it when it
    // unmounted, so claim it explicitly — a terminal you have to click
    // before typing is a broken terminal.
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
      })
      .catch(() => {
        /* HUD stays empty; the terminal still works */
      });
  }, []);

  /* Auto-scroll as content arrives. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  /* Typewriter. Reveals the newest AI message a few characters at a time;
     skipped entirely under prefers-reduced-motion. */
  useEffect(() => {
    const idx = messages.findIndex((m) => m.reveal >= 0);
    if (idx === -1) return;
    const msg = messages[idx];

    if (reduced.current) {
      setMessages((ms) =>
        ms.map((m) => (m.id === msg.id ? { ...m, reveal: -1 } : m)),
      );
      return;
    }

    if (msg.reveal >= msg.text.length) {
      setMessages((ms) =>
        ms.map((m) => (m.id === msg.id ? { ...m, reveal: -1 } : m)),
      );
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

  const push = useCallback((m: Omit<Message, "id">) => {
    setMessages((ms) => [...ms, { ...m, id: nextId.current++ }]);
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sending.current) return;

      /* Purely client-side commands. */
      const lower = text.toLowerCase();
      if (lower === "clear") {
        setMessages([]);
        setInput("");
        return;
      }
      if (lower === "reset") {
        clearToken();
        setToken("");
        setMessages([{ id: nextId.current++, role: "system", text: GREETING, reveal: -1 }]);
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
              .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
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
    [messages, push, token],
  );

  /* Idle nudge — nobody should sit staring at a blinking cursor. */
  useEffect(() => {
    if (busy || nudged || messages.length < 2) return;
    const t = setTimeout(() => {
      setNudged(true);
      push({
        role: "system",
        text: "Still there? Type hint and I will point you at something.",
        reveal: -1,
      });
    }, IDLE_MS);
    return () => clearTimeout(t);
  }, [busy, nudged, messages, push]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Explicit rather than relying on implicit form submission — mobile
    // keyboards vary in what their "Go" key does.
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

  const pct = summary ? (summary.count / summary.total) * 100 : 0;

  return (
    <div className="flex h-dvh flex-col bg-bg">
      {/* HUD ------------------------------------------------- */}
      <header className="shrink-0 border-b border-line bg-surface/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-2.5">
          <Link href="/" className="font-mono text-sm font-semibold text-text">
            ARYAN<span className="text-accent">.EXE</span>
          </Link>

          <div className="ml-auto flex items-center gap-3 font-mono text-[11px] text-text-faint">
            <span>
              LVL <span className="text-accent">{summary?.levelCode ?? "00"}</span>/04
            </span>
            <span className="hidden sm:inline">
              NODES{" "}
              <span className="text-accent">{summary?.count ?? 0}</span>/
              {summary?.total ?? 14}
            </span>
            <div
              className="h-1 w-16 overflow-hidden bg-line"
              role="progressbar"
              aria-valuenow={summary?.count ?? 0}
              aria-valuemin={0}
              aria-valuemax={summary?.total ?? 14}
              aria-label="Nodes discovered"
            >
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <Link
              href="/portfolio"
              className="border border-line px-2 py-1 transition-colors hover:border-line-bright hover:text-text-dim"
            >
              skip →
            </Link>
          </div>
        </div>
      </header>

      {/* Stream ---------------------------------------------- */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          className="mx-auto w-full max-w-3xl px-4 py-6"
          aria-live="polite"
          aria-atomic="false"
        >
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

      {/* Input ----------------------------------------------- */}
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
            placeholder={busy ? "" : "ask me something"}
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
