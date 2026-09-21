import { createHmac, timingSafeEqual } from "node:crypto";
import { isValidNodeId, TOTAL_NODES } from "./nodes";
import { levelFor } from "./levels";
import { tacticDef, type Tactic } from "./tactics";

/* ============================================================
   Progress tokens.

   The client holds an opaque token; the server verifies the
   signature before trusting anything in it.

   This protects nothing sensitive — a forger just reaches the
   content sooner. It exists so that opening a record means the
   visitor actually persuaded the system, and so the ending is not
   spoofable from devtools.
   ============================================================ */

const VERSION = 2;

export interface Progress {
  v: number;
  /** Opened record ids, in the order they were opened. */
  n: string[];
  /** Current target, if the visitor has picked one. */
  k: string | null;
  /** Distinct tactics already spent on the current target. */
  a: Tactic[];
  /**
   * Every lever that has already bought something this session. A pitch
   * that worked once is worth less the second time — otherwise one good
   * line opens the whole profile.
   */
  u: Tactic[];
  /**
   * Levers offered vaguely that have already been pushed back on once for
   * this target. A second attempt counts regardless of how it is judged,
   * so a misread of "vague" costs the visitor one exchange, never a record.
   */
  q: Tactic[];
  t: number;
}

export const EMPTY_PROGRESS: Progress = {
  v: VERSION,
  n: [],
  k: null,
  a: [],
  u: [],
  q: [],
  t: 0,
};

function secret(): string {
  const s = process.env.PROGRESS_SECRET;
  if (s && s.length >= 16) return s;
  // Dev fallback so the app runs before .env.local exists. Rotating this
  // simply invalidates old tokens, which resets progress — the site stays
  // usable, which matters more here than token longevity.
  return "aryan-exe-dev-secret-not-for-production-use";
}

const b64url = (buf: Buffer) => buf.toString("base64url");
const sign = (payload: string) =>
  b64url(createHmac("sha256", secret()).update(payload).digest());

export function encodeProgress(p: Progress): string {
  const payload = b64url(Buffer.from(JSON.stringify(p), "utf8"));
  return `${payload}.${sign(payload)}`;
}

/**
 * Verify and decode. Tampering, malformed input, an unknown record id or
 * a stale version all yield EMPTY_PROGRESS — we reset rather than throw,
 * so a corrupted value degrades into "start over", not a broken page.
 */
export function decodeProgress(token: string | undefined | null): Progress {
  if (!token || typeof token !== "string") return EMPTY_PROGRESS;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return EMPTY_PROGRESS;

  const payload = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(payload));

  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return EMPTY_PROGRESS;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<Progress>;

    if (parsed?.v !== VERSION || !Array.isArray(parsed.n)) return EMPTY_PROGRESS;

    const n = Array.from(
      new Set(
        parsed.n.filter((x): x is string => typeof x === "string" && isValidNodeId(x)),
      ),
    );
    const k =
      typeof parsed.k === "string" && isValidNodeId(parsed.k) ? parsed.k : null;
    const tacticList = (v: unknown): Tactic[] =>
      Array.isArray(v)
        ? Array.from(new Set(v.filter((x): x is Tactic => typeof x === "string")))
        : [];

    return {
      v: VERSION,
      n,
      k,
      a: tacticList(parsed.a),
      u: tacticList(parsed.u),
      q: tacticList(parsed.q),
      t: typeof parsed.t === "number" ? parsed.t : 0,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

const stamp = () => Math.floor(Date.now() / 1000);

export function openRecords(p: Progress, ids: string[]): Progress {
  const n = new Set(p.n);
  for (const id of ids) if (isValidNodeId(id)) n.add(id);
  // Opening the target clears it, so the next question starts fresh.
  const clearTarget = p.k !== null && ids.includes(p.k);
  // Whatever paid for this record is now spent goods.
  const u = ids.length ? Array.from(new Set([...p.u, ...p.a])) : p.u;
  return {
    v: VERSION,
    n: Array.from(n),
    k: clearTarget ? null : p.k,
    a: clearTarget ? [] : p.a,
    q: clearTarget ? [] : p.q,
    u,
    t: stamp(),
  };
}

/** Switching target resets the tactics spent — each lock is paid separately. */
export function setTarget(p: Progress, id: string | null): Progress {
  if (id === p.k) return p;
  return { ...p, k: id, a: [], q: [], t: stamp() };
}

/** Record that we have already asked this lever to be made specific. */
export function pushForSpecifics(p: Progress, tactics: Tactic[]): Progress {
  if (!tactics.length) return p;
  return { ...p, q: Array.from(new Set([...p.q, ...tactics])), t: stamp() };
}

export function spendTactics(p: Progress, tactics: Tactic[]): Progress {
  if (!tactics.length) return p;
  return { ...p, a: Array.from(new Set([...p.a, ...tactics])), t: stamp() };
}

export function progressSummary(p: Progress) {
  const count = p.n.length;
  const level = levelFor(count);
  return {
    nodes: p.n,
    count,
    total: TOTAL_NODES,
    target: p.k,
    spent: p.a,
    pushed: p.q,
    used: p.u,
    // Human-readable, so the client can explain a resumed session without
    // importing lib/game/tactics — those patterns are the answer key.
    usedLabels: p.u.map((t) => tacticDef(t)?.label ?? t),
    level: level.n,
    levelCode: level.code,
    levelLabel: level.label,
    complete: count >= TOTAL_NODES,
  };
}
