# PLAN — claude-mods-playground

## Goal
Let one user feel Claude Mods (function-hooks style middleware: `on` / `next` / `$`) by writing a tiny TypeScript mod and watching a fake `tool.call` fold through the onion — without installing Claude Code.

## Single-user MVP
- In-browser (or Monaco-lite / textarea) editor with a starter mod that registers `on("tool.call", …)`
- Runtime simulator in the app: compose middleware chain, call `next(e)`, expose a minimal `$` (log / deny / rewrite helpers)
- Trigger panel: pick a fake tool (`Bash` / `Write` / `Read`) + JSON-ish input → Run
- Visual “onion”: ordered steps before / instead / after with deny, rewrite, or pass + final result
- 2–3 preset mods: (1) deny `rm -rf`, (2) rewrite path, (3) audit log — one-click load into the editor
- Optional fun payoff: tiny “Tetris-style” panel that a sample mod can toggle via `$` (keep small)

## Out of scope
- Real Claude Code / Anthropic API / installing the CLI
- Full LSP / plugin packaging / settings.json authoring
- Multi-user, persistence beyond localStorage for the last mod source
- Faithful reimplementation of every Claude Code event — only `tool.call` (and maybe one sibling) for the demo

## Outcome-oriented tasks
1. Scaffold under `apps/claude-mods-playground/` via `bunx create-next-app` (Bun, TS, Tailwind, App Router). App `bunfig.toml` with `minimumReleaseAge = 259200` before `bun install`.
2. Init shadcn/ui minimalist — button, textarea/input, card, badge, scroll-area.
3. Implement a small pure TS middleware engine (`compose` / `on` / `next` / `$`) with unit-smoke via a tiny pure function test or story fixtures.
4. UI: editor + presets + Run + onion visualization of each layer’s decision.
5. README: what Claude Mods are (one paragraph), how to run (`bun install && bun run dev`), what you’re looking at.
6. Validation: screenshot of onion after a deny/rewrite + video of edit → Run → visual fold. Attach both to the PR.

## Stack
- **Bun** — monorepo convention
- **Next.js App Router** — one-screen lab, no backend required (engine runs client-side)
- **shadcn/ui + Tailwind** — minimal chrome
- **Pure TS middleware engine** — the demo is the concept, not a dependency on unreleased Claude Code internals

## Deferred
- Live load of Claude Code `/plugin-types` declarations
- Vercel `rootDirectory: apps/claude-mods-playground`
- Full Tetris game (keep the “fun mod” as a tiny animated panel if time)

## Pitch (for humans)
- Зачем: показать, как Claude Mods перехватывает вызов инструмента (deny / rewrite / audit) без установки Claude Code.
- На экране: редактор крошечного TypeScript-мода + кнопка «вызвать tool» и визуальная цепочка `on → next → $` с результатом.
