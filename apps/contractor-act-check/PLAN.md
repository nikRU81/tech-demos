# PLAN — contractor-act-check

**Management task:** a manager checks a contractor's completion act against the contract in one minute and sees which lines are overstated in volume or price before signing.

## Goal
One screen: pick a KS-2 style completion act (scan), compare each line to the contract bill of quantities, highlight volume/price/unknown deviations in rubles, and show a accept/return verdict — powered by Gemini multimodal extraction (or demo pre-extracts) and deterministic matching in TypeScript.

## Single-user MVP
- Synthetic contract (~18 BoQ lines) for generic "Площадка А, обслуживание технологического трубопровода" (invented work types, units, volumes, unit prices in RUB).
- Three bundled completion acts as scan-like PNGs in `public/acts/` plus pre-extracted JSON per act with seeded deviations (volume over, price over, line not in contract, cumulative volume over contract).
- UI (Russian): act selector; left pane scan image; right pane contract table; center/below reconciliation table with statuses OK / перебор объёма / цена выше договора / нет в договоре, deviation ₽; totals strip (act total, overstated, %); verdict badge «Принять» / «Вернуть на доработку» with short reasons.
- `POST /api/extract`: Gemini (`@google/genai`) when `GEMINI_API_KEY` set; otherwise return bundled extraction + demo banner.
- Pure matching in `src/features/reconcile/` with `bun test`.
- `scripts/extract-with-cli.sh` documenting [gemini-api-cli](https://github.com/google-gemini/gemini-api-cli) usage.
- `vercel.json` with `{"framework":"nextjs"}`.

## Out of scope
- Real companies, sites, clients, cost codes, or regulatory norm references (synthetic only).
- User auth, persistence, PDF upload parsing in MVP (bundled acts + optional future upload stub).
- Go CLI on Vercel runtime (document CLI for local/agent use only).

## Outcome-oriented tasks
1. Scaffold `apps/contractor-act-check/` via `bunx create-next-app` (TS, Tailwind, App Router), `bunfig.toml`, `bun install`.
2. shadcn/ui: `button`, `card`, `badge`, `table`, `select`, `alert`, `scroll-area`, `separator`.
3. Domain: contract + act types, synthetic `data/contract.ts`, `data/acts.ts`, pre-extracted `data/extractions/*.json`.
4. Reconciliation engine: line match by normalized work name + unit, compare volume/price/cumulative, compute verdict; tests.
5. Generate scan-like act PNGs (script or SVG→PNG) with slight visual noise; store under `public/acts/`.
6. UI layout and demo-mode banner; wire extract API + client flow.
7. README (gemini-api-cli inspiration, env, demo mode), `.env.example`, `scripts/extract-with-cli.sh`.
8. Validation: `bun test`, `bun run build`, browser demo flow, screenshot + video for PR.

## Stack
- **Bun** — runtime, tests, install policy.
- **Next.js App Router** — server route for Gemini, matches sibling apps.
- **shadcn/ui + Tailwind** — reconciliation UI.
- **@google/genai** — multimodal act extraction when keyed.
- **Static TS data + JSON** — contract and demo extractions.

## Deferred
- Live PDF upload + client-side OCR fallback.
- Multi-act cumulative history across periods.
- Export signed audit PDF.

## Pitch (for humans)
- За минуту: менеджер сверяет акт КС-2 с договором, видит завышения по объёму и цене в рублях и решение — принять или вернуть на доработку.