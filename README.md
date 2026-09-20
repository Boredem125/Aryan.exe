# ARYAN.EXE

An AI-native portfolio that withholds its own contents.

The catalogue is public. The contents are not.

A visitor arrives to a list of nine records — patents, industry experience,
competition record, engineering work, contact — and can see exactly what exists.
What they cannot do is look inside. A record opens when they give the system a
reason with something at stake: an offer of work, a referral, funding, press or
academic interest. Curiosity is not currency.

The point is that a recruiter who only cares about one record goes straight at
it. Nobody should have to excavate eleven others to reach the patents.

The levers are textbook social-engineering pretexts, which is the joke: a
security portfolio that makes you run a pretext to get in teaches more than one
that lists "social engineering" as a skill. For a few minutes, the visitor is
the attacker.

Recruiters in a hurry can skip all of it: `./normal-portfolio`.

## How the gate actually works

Locked content is never placed in the model's context window. `/api/ask` assembles
the system prompt per request from the visitor's current progress only — full detail
for unlocked nodes, one-line teasers for the next tier, nothing for anything deeper.

There is no system prompt to extract and no secret to jailbreak out, because the
secret was never sent. The gate is server-side data assembly, not model obedience.

Unlocks are decided by a deterministic server-side matcher, never by the model.
The model narrates; the server arbitrates — so no amount of arguing with it
changes who gets in.

The valuable records cost more. Patents want two *distinct* levers from
{funding, academic, press}, and only one lever counts per message, so a price of
two means two real exchanges rather than one sentence that trips two patterns.

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
model's reply. It has already caught one real leak (a record label naming the
employer while still sealed).

`playthrough` has caught two: an incidental word in a persuasion sentence
hijacking the visitor's chosen target, and a single sentence paying a price of
two because "fund this research" reads as both funding and academic.

Note that `tsc --noEmit` alone can pass on stale incremental state — use
`npx tsc --noEmit --incremental false` when it matters.

## Notes

- `lib/profile/` is the single source of truth. Edit it and the whole site follows.
- The terminal is a client component and must never import `lib/profile` — that
  would bundle the entire profile, patents included, into the JavaScript every
  visitor downloads. Panels are built server-side in `lib/game/panels.ts` and
  filtered against the verified progress token.
- Patents are deliberately absent from `/portfolio`. They are the endgame.
- `lib/game/nodes.ts` and `lib/game/tactics.ts` must never be imported from a
  client component — the tactic patterns are the answer key.
