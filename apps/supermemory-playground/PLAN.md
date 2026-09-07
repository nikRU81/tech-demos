# PLAN — supermemory-playground

## Goal
Single-user playground that stores notes in Supermemory and recalls them in chat across sessions.

## Single-user MVP
- Add a note (text) into Supermemory with a fixed `containerTag` (e.g. `playground-demo`)
- List / search memories via `client.search({ searchMode: "hybrid" })`
- Chat panel: user asks a question → `client.profile({ containerTag, q })` (or search) → show recalled context + a simple answer that cites memories
- Persist nothing locally beyond the Supermemory container (refresh still recalls)
- Env: `SUPERMEMORY_API_KEY` (document in `.env.example`)

## Out of scope
- Auth / multi-user
- File uploads, connectors, self-hosted Supermemory
- Agent frameworks, streaming LLM beyond a thin optional call
- Admin UI, billing, metadata filters beyond containerTag

## Outcome-oriented tasks
1. Scaffold Next.js (App Router) under `apps/supermemory-playground/` via `bunx create-next-app` (Bun, TypeScript, Tailwind). Add root `bunfig.toml` with `minimumReleaseAge = 259200` before `bun install`.
2. Init shadcn/ui (minimalist) — button, input, textarea, card, scroll-area as needed.
3. Wire Supermemory TypeScript SDK (`supermemory`) server-side only: `add`, `search`, `profile` helpers with `containerTag: "playground-demo"`.
4. UI: Notes form (add) + memory list/search + chat that shows recalled memories when answering.
5. Graceful empty/error states when `SUPERMEMORY_API_KEY` is missing (clear banner + disable mutate actions).
6. README: `bun install && bun run dev`, env setup, one-line product pitch.
7. Validation: run the app, capture **screenshot + video** of add → recall path for the PR.

## Stack
- **Bun** — runtime / package manager (monorepo convention)
- **Next.js App Router** — boring full-stack default for server SDK calls without exposing the API key
- **shadcn/ui + Tailwind** — minimal UI
- **supermemory** — official TypeScript SDK (`client.add`, `client.search`, `client.profile`)

## Deferred
- Real LLM answer synthesis (MVP can template: “Based on your memories: …”)
- Per-browser container tags / local user ids
- Vercel project `rootDirectory: apps/supermemory-playground` (owner can wire after merge)
