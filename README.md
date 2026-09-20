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

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Groq

## Local development

```bash
npm install
cp .env.example .env.local   # add GROQ_API_KEY and PROGRESS_SECRET
npm run dev
```

The puzzle remains fully completable with the LLM offline — the matcher is
model-independent and scripted fallbacks cover every node.
