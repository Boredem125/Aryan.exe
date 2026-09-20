# ARYAN.EXE

An AI-native portfolio that withholds its own contents.

The landing page is a terminal. A "Portfolio Intelligence System" knows everything
about Aryan Hundia and is instructed to reveal almost none of it. Visitors unlock
the profile by asking better questions.

Recruiters in a hurry can skip the whole thing: `./normal-portfolio`.

## How the gate actually works

Locked content is never placed in the model's context window. `/api/ask` assembles
the system prompt per request from the visitor's current progress only — full detail
for unlocked nodes, one-line teasers for the next tier, nothing for anything deeper.

There is no system prompt to extract and no secret to jailbreak out, because the
secret was never sent. The gate is server-side data assembly, not model obedience.

Unlocks are decided by a deterministic server-side matcher, never by the model.
The model narrates; the server arbitrates.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Groq (`openai/gpt-oss-120b`)

`gpt-oss` is a reasoning model, so the client sends `reasoning_effort: "low"`.
Without it the model spends the entire token budget thinking and returns empty
content, which silently forces every reply down the fallback path.

## Local development

```bash
npm install
cp .env.example .env.local   # add GROQ_API_KEY and PROGRESS_SECRET
npm run dev
```

The puzzle remains fully completable with the LLM offline — the matcher is
model-independent and scripted fallbacks cover every node.

## Checks

```bash
npm run leakcheck    # asserts locked content never enters the prompt payload
npm run playthrough  # simulates a full visit; fails loudly on a dead end
```

`leakcheck` is the one that matters. The security claim here is about what is
placed in the model's context, so it tests the prompt payload rather than the
model's reply. It has already caught one real leak (a node label naming the
employer while still sealed).

## Notes

- `lib/profile/` is the single source of truth. Edit it and the whole site follows.
- The terminal is a client component and must never import `lib/profile` — that
  would bundle the entire profile, patents included, into the JavaScript every
  visitor downloads. Panels are built server-side in `lib/game/panels.ts` and
  filtered against the verified progress token.
- Patents are deliberately absent from `/portfolio`. They are the endgame.
