# tech-demos

Sticky monorepo for weekday X-bookmark tech demos.

- One self-contained app per pick under `apps/<slug>/`
- Plan with `skills/project-planning/`
- Track proposed bookmarks in `tracking/seen-bookmarks.json`
- Cloud agents only touch `apps/<slug>/`, open one PR, and attach screenshot + video validation
- Deploys: **Vercel** (root directory `apps/<slug>/` per app)

```bash
cd apps/<slug>
bun install
bun run dev
```
