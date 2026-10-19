# anatomy-risk-map

One-screen demo: an interactive isometric pumping-station diagram whose units are heat-colored by synthetic operational risk, with a top-5 action list and per-unit risk cards.

## Anatomy figure

The isometric artwork is built with the open-source [Anatomy](https://github.com/wheresryan22/anatomy) kit (MIT): handcrafted SVG solids with four-tone shading and painter's order. This app vendors the needed kit files under `src/features/station/anatomy-kit/` so it runs without installing the skill. The station layout follows the Anatomy workflow (Hero-sized part list, light theme, structure → mechanism → subject).

Bookmark: [Anatomy on X](https://x.com/wheresryan22/status/2108948624004526516).

## Run

```bash
bun install
bun run dev
```

Production build:

```bash
bun run build
bun run start
```

Tests (ranking / filter logic):

```bash
bun test
```

## On screen

- **Diagram** — generic pumping station; 11 clickable units tinted green → amber → red by risk score; overdue inspections show a badge.
- **Filters** — All, Equipment, HSE, Deadlines (dims non-matching units and re-ranks actions).
- **KPI strip** — high-risk unit count, overdue inspections, 12-month incidents.
- **Right panel** — top-5 prioritized actions, or a unit risk card after selection (Esc clears).

All register data is synthetic and client-side; no API keys.
