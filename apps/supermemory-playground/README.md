# Supermemory Playground

Add notes, then recall them in chat — a single-user playground for the [Supermemory Memory API](https://supermemory.ai/docs/memory-api/sdks/typescript). Memories persist across sessions in the `playground-demo` container tag; nothing is stored locally.

## Run

```bash
cd apps/supermemory-playground
cp .env.example .env.local   # add your SUPERMEMORY_API_KEY
bun install
bun run dev
```

Without an API key the app still renders, with a banner and disabled writes.

## What it does

- **Add a note** — `client.add({ content, containerTag: "playground-demo" })`
- **List / search memories** — `client.documents.list` + `client.search.memories({ searchMode: "hybrid" })`
- **Chat / recall** — `client.profile({ containerTag, q })` plus hybrid search; the answer is templated from recalled memories (no LLM call in the MVP)

All Supermemory calls run server-side (Next.js route handlers) so the API key is never exposed to the browser.

## Stack

Bun · Next.js (App Router) · Tailwind · shadcn/ui · [`supermemory`](https://www.npmjs.com/package/supermemory) TypeScript SDK
