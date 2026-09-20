import { NextResponse } from "next/server";
import { match } from "@/lib/game/matcher";
import {
  decodeProgress,
  encodeProgress,
  addNodes,
  progressSummary,
  publicNodeCount,
} from "@/lib/game/progress";
import { buildSystemPrompt } from "@/lib/llm/prompt";
import { chat, groqConfigured, type ChatMessage } from "@/lib/llm/groq";
import { fallbackReply, throttleReply } from "@/lib/llm/fallback";
import { checkLimit, clientIp } from "@/lib/ratelimit";
import { handleCommand } from "@/lib/game/commands";

export const runtime = "nodejs";

const MAX_MESSAGE = 600;
const MAX_HISTORY = 6;

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

  // Verify before trusting a single node. A forged or corrupted token
  // decodes to empty progress rather than erroring.
  const progress = decodeProgress(
    typeof body.token === "string" ? body.token : undefined,
  );

  /* --- commands bypass the model entirely: instant and free ---- */
  const command = handleCommand(message, progress);
  if (command) {
    const next = command.unlocks?.length
      ? addNodes(progress, command.unlocks)
      : progress;
    return NextResponse.json({
      reply: command.reply,
      unlocks: command.unlocks ?? [],
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
        unlocks: [],
        token: encodeProgress(progress),
        summary: progressSummary(progress),
        source: "throttle",
      },
      { status: 429 },
    );
  }

  /* --- the server decides what opens. Never the model. --------- */
  const result = match(message, progress);
  const next = result.unlocks.length ? addNodes(progress, result.unlocks) : progress;

  const system = buildSystemPrompt({
    progress: next,
    intents: result.intents,
    justUnlocked: result.unlocks,
    patentsTeased: result.patentsTeased,
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
      reply = fallbackReply(
        message,
        next,
        result.intents,
        result.unlocks,
        result.patentsTeased,
      );
    }
  } else {
    reply = fallbackReply(
      message,
      next,
      result.intents,
      result.unlocks,
      result.patentsTeased,
    );
  }

  return NextResponse.json({
    reply,
    unlocks: result.unlocks,
    token: encodeProgress(next),
    summary: progressSummary(next),
    source,
  });
}

/** Lets the client bootstrap its HUD without asking anything. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const progress = decodeProgress(url.searchParams.get("token") ?? undefined);
  return NextResponse.json({
    summary: progressSummary(progress),
    token: encodeProgress(progress),
    count: publicNodeCount(progress),
    llm: groqConfigured(),
  });
}
