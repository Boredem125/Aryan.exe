/* ============================================================
   Groq client.

   OpenAI-compatible endpoint. The key is read from the server
   environment and never leaves it — nothing here is importable
   from a client component.
   ============================================================ */

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const TIMEOUT_MS = 8000;

export type GroqFailure =
  | "no-key"
  | "timeout"
  | "rate-limited"
  | "upstream-error"
  | "empty";

export type GroqResult =
  | { ok: true; text: string }
  | { ok: false; reason: GroqFailure };

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function groqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

async function once(messages: ChatMessage[]): Promise<GroqResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { ok: false, reason: "no-key" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 320,
        top_p: 0.9,
      }),
      signal: controller.signal,
    });

    if (res.status === 429) return { ok: false, reason: "rate-limited" };
    if (!res.ok) return { ok: false, reason: "upstream-error" };

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: false, reason: "empty" };

    return { ok: true, text };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }
    return { ok: false, reason: "upstream-error" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * One retry, and only for failures that a retry could plausibly fix.
 * A missing key or a rate limit will not improve on a second attempt,
 * so those fall through to the scripted path immediately.
 */
export async function chat(messages: ChatMessage[]): Promise<GroqResult> {
  const first = await once(messages);
  if (first.ok) return first;
  if (first.reason === "no-key" || first.reason === "rate-limited") return first;
  return once(messages);
}
