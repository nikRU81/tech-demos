# AGENTS.md — tech-demos sticky monorepo

## Purpose
One sticky GitHub monorepo for small public tech demos. Never create a new repository per demo.

## Layout
- `apps/<kebab-slug>/` — one self-contained app per pick (`bun install && bun run dev`)
- `skills/project-planning/` — vendored planning skill; use before implementing
- `tracking/seen-bookmarks.json` — proposed/built bookmark ids (do not re-propose)
- `AGENTS.md` — this file

## Cloud agent rules
1. Only add or update `apps/<kebab-slug>/` for the approved pick. Do not refactor sibling apps or repo root tooling unless asked.
2. Before coding: run the project-planning skill and write `apps/<kebab-slug>/PLAN.md`.
3. Use Bun. Include `bunfig.toml` with `[install] minimumReleaseAge = 259200` before installs.
4. Prefer official scaffolds via `bunx create-*` and shadcn/ui for UI.
5. Model for initial prototypes: `claude-fable-5` (Fable 5) unless the owner overrides.
6. Open **one** PR. Attach **both** at least one screenshot **and** at least one video of the running app.
7. Never create a new GitHub repository.

## Validation
Screenshot + video of the running app in the PR are required, not optional.
