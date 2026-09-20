import { NextResponse } from "next/server";
import { match } from "@/lib/game/matcher";
import {
  decodeProgress,
  encodeProgress,
  openRecords,
  setTarget,
  spendTactics,
  progressSummary,
} from "@/lib/game/progress";
import { catalogue } from "@/lib/game/nodes";
import { buildSystemPrompt } from "@/lib/llm/prompt";
import { chat, groqConfigured, type ChatMessage } from "@/lib/llm/groq";
import { fallbackReply, throttleReply } from "@/lib/llm/fallback";
import { checkLimit, clientIp } from "@/lib/ratelimit";
import { handleCommand } from "@/lib/game/commands";
import { panelsFor } from "@/lib/game/panels";

export const runtime = "nodejs";

const MAX_MESSAGE = 600;
const MAX_HISTORY = 10;

interface AskBody {
  message?: unknown;
  token?: unknown;
  history?: unknown;
}

export async function POST(req: Request) {
  let body: AskBody;
  try {
    body = (await req.json()) as AskBody;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const raw = typeof body.message === "string" ? body.message.trim() : "";
  if (!raw) return NextResponse.json({ error: "empty message" }, { status: 400 });
  const message = raw.slice(0, MAX_MESSAGE);

  // Verify before trusting anything in it. A forged or corrupted token
  // decodes to empty progress rather than erroring.
  const progress = decodeProgress(
    typeof body.token === "string" ? body.token : undefined,
  );

  /* --- commands bypass the model: instant and free ------------- */
  const command = handleCommand(message, progress);
  if (command) {
    let next = progress;
    if (command.open?.length) next = openRecords(next, command.open);
    if (command.target !== undefined) next = setTarget(next, command.target);

    // `open <record>` wants a panel, not prose. panelsFor filters against
    // verified progress, so an unearned id returns nothing.
    const openMatch = command.reply.match(/^__OPEN__(.+)$/);
    const requested = openMatch ? [openMatch[1]] : (command.open ?? []);

    return NextResponse.json({
      reply: openMatch ? "" : command.reply,
      opened: command.open ?? [],
      panels: panelsFor(requested, next),
      token: encodeProgress(next),
      summary: progressSummary(next),
      source: "system",
    });
  }

  const limit = checkLimit(clientIp(req));
  if (!limit.allowed) {
    return NextResponse.json(
      {
        reply: throttleReply(),
        opened: [],
        panels: [],
        token: encodeProgress(progress),
        summary: progressSummary(progress),
        source: "throttle",
      },
      { status: 429 },
    );
  }

  /* --- the server decides what opens. Never the model. --------- */
  const result = match(message, progress);

  let next = setTarget(progress, result.target);
  if (result.accepted.length) next = spendTactics(next, result.accepted);
  if (result.opened.length) next = openRecords(next, result.opened);

  const system = buildSystemPrompt({
    progress: next,
    intents: result.intents,
    opened: result.opened,
    target: result.opened.length ? null : result.target,
    accepted: result.accepted,
    rejected: result.rejected,
    stale: result.stale,
    awaitingLeverage: result.awaitingLeverage,
    shortBy: result.shortBy,
  });

  const history: ChatMessage[] = Array.isArray(body.history)
    ? (body.history as unknown[])
        .filter(
          (m): m is { role: string; content: string } =>
            typeof m === "object" &&
            m !== null &&
            typeof (m as { content?: unknown }).content === "string" &&
            ((m as { role?: unknown }).role === "user" ||
              (m as { role?: unknown }).role === "assistant"),
        )
        .slice(-MAX_HISTORY)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content.slice(0, MAX_MESSAGE),
        }))
    : [];

  const scripted = () =>
    fallbackReply(
      next,
      result.intents,
      result.opened,
      result.opened.length ? null : result.target,
      result.accepted,
      result.rejected,
      result.stale,
      result.awaitingLeverage,
      result.shortBy,
    );

  let reply: string;
  let source: "groq" | "fallback" = "fallback";

  if (groqConfigured()) {
    const res = await chat([
      { role: "system", content: system },
      ...history,
      { role: "user", content: message },
    ]);
    if (res.ok) {
      reply = res.text;
      source = "groq";
    } else {
      reply = scripted();
    }
  } else {
    reply = scripted();
  }

  return NextResponse.json({
    reply,
    opened: result.opened,
    panels: panelsFor(result.opened, next),
    token: encodeProgress(next),
    summary: progressSummary(next),
    source,
  });
}

/** Bootstraps the HUD and the catalogue without asking anything. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const progress = decodeProgress(url.searchParams.get("token") ?? undefined);
  return NextResponse.json({
    summary: progressSummary(progress),
    token: encodeProgress(progress),
    catalogue: catalogue(),
    llm: groqConfigured(),
  });
}
