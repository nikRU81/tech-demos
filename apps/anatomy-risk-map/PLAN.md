# PLAN — anatomy-risk-map

**Management task:** a manager sees in one minute which units of a site carry the highest operational risk and what to do first.

## Goal
One screen: an interactive isometric diagram of a generic pumping station whose 8–10 units are heat-colored by risk score, with a click-through risk card and a top-5 prioritized action list — built with the Anatomy skill (github.com/wheresryan22/anatomy) and fully synthetic data.

## Single-user MVP
- Isometric SVG figure of a generic pumping station (Anatomy kit, light theme), 8–10 clickable units, e.g.: intake/suction header, inlet strainer, pump P-1, pump P-2 (standby), electric motors/VFD cabinet, discharge valve manifold, surge vessel, flow meter skid, storage tank, control room/MCC, fire pump/HSE station.
- Synthetic risk register (`data/risk-register.ts`, typed): per unit — probability (1–5), impact (1–5), score = P×I, risk type (`equipment` | `hse` | `deadlines`), last inspection date, inspection interval, incident count (12 mo), short findings, 2–4 recommended actions with effort and due date.
- Heatmap coloring: unit fill/overlay mapped from score (green → amber → red) with a legend; overdue inspections get a badge.
- Click/keyboard-select a unit → right-side risk card (score breakdown P×I, last inspection + days overdue, incidents, findings, prioritized actions).
- Right panel default: **Top-5 actions** across the site, ranked by score × urgency (overdue days, incidents), each linking back to its unit.
- Filter by risk type: All / Equipment / HSE (ОТиПБ) / Deadlines — recolors the diagram and re-ranks top-5.
- Small KPI strip: units at high risk, overdue inspections, incidents in 12 mo.
- No external API keys, no backend: everything client-side. `bun install && bun run dev`.

## Out of scope
- Real site data, real equipment specs, any real organization or norms (synthetic only)
- Editing the register, persistence, auth, multi-user
- Full Anatomy "Epic" (whole plant with moving systems) — build a **Hero**-sized figure (80–150 parts) that reads as a pumping station
- 3D mode; WebGL is optional (e.g. subtle glow on the red units or water in the tank) and the SVG must read without it

## Outcome-oriented tasks
1. Scaffold `apps/anatomy-risk-map/` with `bunx create-next-app` (TS, Tailwind, App Router, no install), add `bunfig.toml` with `[install] minimumReleaseAge = 259200`, then `bun install`.
2. Init shadcn/ui (minimalist preset); add only `card`, `badge`, `button`, `toggle-group` (or `tabs`), `scroll-area`, `separator`.
3. Anatomy figure: clone github.com/wheresryan22/anatomy at build time, follow its `SKILL.md` workflow (size = Hero, parts list first, kit geometry, painter's order, audit/lines checks). Vendor only the needed kit files (MIT, keep license header) under `src/features/station/anatomy-kit/` or commit the generated SVG/React components; each unit is a `<g data-unit-id>` so the app can color and hit-test it. Runtime must not depend on the skill being installed.
4. Risk model: pure TS `src/features/risk/` — score, urgency, ranking, filter; tiny `bun test` for ranking + filter.
5. UI: diagram (left/center) + right panel (Top-5 ↔ selected unit card) + type filter + KPI strip + legend; hover highlight, focus ring, Esc clears selection.
6. README: what Anatomy is (one paragraph, link to source bookmark and repo), how to run, what's on screen, data is synthetic.
7. Validation: `bun run build` passes; capture a screenshot (heatmap + open risk card) and a short video (filter switch → click unit → card → top-5) of the running app; attach **both** to the single PR.

## Stack
- **Bun** — monorepo convention (runtime, package manager, tests)
- **Next.js App Router** — one-page, client-only, matches sibling apps
- **shadcn/ui + Tailwind** — minimal panel chrome
- **Anatomy kit** (zero-dependency Node/TS, SVG + optional WebGL) — the isometric figure; React helpers from `kit/react`
- **Static TS risk register** — synthetic, no API keys

## Deferred
- Vercel project with `rootDirectory: apps/anatomy-risk-map`
- Time slider (risk trend), CSV import of a register, exploded "apart" view per unit
- Dark theme

## Pitch (for humans)
- Зачем: руководитель за минуту видит, какие узлы площадки несут наибольший операционный риск и что делать в первую очередь.
- На экране: изометрическая схема типовой насосной станции, 8–10 узлов окрашены по уровню риска; клик по узлу — карточка риска с приоритетными действиями; справа — топ-5 действий и фильтр по типу риска (оборудование, ОТиПБ, сроки).
