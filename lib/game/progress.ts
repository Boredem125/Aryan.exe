import { createHmac, timingSafeEqual } from "node:crypto";
import { isValidNodeId } from "./nodes";
import { levelFor, TOTAL_NODES } from "./levels";

/* ============================================================
   Progress tokens.

   The client holds an opaque token in localStorage and sends it
   with every request. The server verifies the signature before
   trusting a single node in it.

   This is not protecting anything sensitive — a visitor who forges
   progress just gets the content sooner. It exists so that reaching
   ACCESS LEVEL 04 means the visitor actually got there, and so the
   endgame is not trivially spoofable from devtools.
   ============================================================ */

const VERSION = 1;

export interface Progress {
  v: number;
  /** Discovered node ids, deduped. */
  n: string[];
  /** Issued-at, epoch seconds. */
  t: number;
}

export const EMPTY_PROGRESS: Progress = { v: VERSION, n: [], t: 0 };

function secret(): string {
  const s = process.env.PROGRESS_SECRET;
  if (s && s.length >= 16) return s;
  // Dev fallback so the app runs before .env.local exists. A rotating
  // secret simply invalidates old tokens, which resets progress — the
  // site stays usable, which matters more here than token longevity.
  return "aryan-exe-dev-secret-not-for-production-use";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", secret()).update(payload).digest());
}

export function encodeProgress(p: Progress): string {
  const payload = b64url(Buffer.from(JSON.stringify(p), "utf8"));
  return `${payload}.${sign(payload)}`;
}

/**
 * Verify and decode. Any tampering, malformed input or unknown node id
 * yields EMPTY_PROGRESS — we reset rather than throw, so a corrupted
 * localStorage value degrades into "start over" instead of a broken page.
 */
export function decodeProgress(token: string | undefined | null): Progress {
  if (!token || typeof token !== "string") return EMPTY_PROGRESS;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return EMPTY_PROGRESS;

  const payload = token.slice(0, dot);
  const given = token.slice(dot + 1);
  const expected = sign(payload);

  // Constant-time compare; lengths must match first or timingSafeEqual throws.
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return EMPTY_PROGRESS;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as unknown;

    if (typeof parsed !== "object" || parsed === null) return EMPTY_PROGRESS;
    const p = parsed as Partial<Progress>;
    if (p.v !== VERSION || !Array.isArray(p.n)) return EMPTY_PROGRESS;

    const nodes = Array.from(
      new Set(p.n.filter((x): x is string => typeof x === "string" && isValidNodeId(x))),
    );

    return { v: VERSION, n: nodes, t: typeof p.t === "number" ? p.t : 0 };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function addNodes(p: Progress, ids: string[]): Progress {
  const next = new Set(p.n);
  for (const id of ids) if (isValidNodeId(id)) next.add(id);
  return { v: VERSION, n: Array.from(next), t: Math.floor(Date.now() / 1000) };
}

/** Public nodes only — the secret node does not count toward the total. */
export function publicNodeCount(p: Progress): number {
  return p.n.filter((id) => id !== "PATENTS").length;
}

export function progressSummary(p: Progress) {
  const count = publicNodeCount(p);
  const level = levelFor(count);
  return {
    nodes: p.n,
    count,
    total: TOTAL_NODES,
    level: level.n,
    levelCode: level.code,
    levelLabel: level.label,
    complete: count >= TOTAL_NODES,
    patentsUnlocked: p.n.includes("PATENTS"),
  };
}
