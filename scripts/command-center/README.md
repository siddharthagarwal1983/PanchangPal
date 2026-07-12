# PanchangPal — Engineering Command Center

An internal, developer-facing command center that is **generated from the repository**, not
hand-maintained. `generate.mjs` parses the project's operating docs and source, infers progress,
and writes `command-center.json`; the dashboard (a hash-routed single-page app) renders it. When the
docs change, the data — and every view — updates automatically.

Open it and you can answer, in a few seconds: **Can we ship today? What's blocked? What's next?
What changed? Is the project healthy? Is the architecture healthy?**

## Layout

A grouped left-nav routes between focused views (no more single long scroll):

- **Overview** — Engineering Cockpit (go/no-go verdict, readiness, module health, recent changes/decisions, upcoming milestones)
- **Delivery** — Roadmap · Phase Tracker · Milestones
- **Architecture** — ADR Explorer (filter + detail drawer) · Decision Timeline · Traceability · Dependency Graph (pan/zoom + upstream/downstream highlight) · AI Context Graph
- **Quality** — Module Health · Repository Health · Technical Debt (kanban) · Test Coverage · Documentation Drift · CI/CD
- **Risk** — Blockers · Risk Register · Release Readiness
- **Activity** — Engineering Journal (structured session log + expandable commit history)

The go/no-go verdict lives in the top bar on every page.

## Run it

```bash
# One-shot: parse the repo → command-center.json, then open index.html over a static server
node scripts/command-center/serve.mjs           # → http://localhost:4599  (watches + auto-regenerates)

# Or generate once and serve however you like
node scripts/command-center/generate.mjs         # writes command-center.json
python3 -m http.server -d scripts/command-center 4599
```

- **Auto-update:** `serve.mjs` watches `.claude/`, `docs/`, `apps/`, `packages/`, `.github/` and
  rebuilds the JSON on any change; the page polls the JSON every 5s and re-renders when it changes.
  (`generate.mjs --watch` does the same without the server.)
- **Themes:** light/dark toggle (persisted); respects the OS preference by default.
- **Responsive:** side-nav collapses on narrow screens.

## What it shows (all data-driven, every card links to source)

| Card | Derived from |
|---|---|
| Executive Dashboard | `.claude/PROJECT_STATUS.md`, `DASHBOARD.md` |
| Roadmap | `.claude/IMPLEMENTATION_ROADMAP.md` |
| Phase Tracker | `PROJECT_STATUS.md` phase table |
| Milestone Tracker | `CURRENT_MILESTONE.md` slice table |
| ADR Timeline | `docs/architecture/adr/README.md` index |
| Traceability Matrix | `docs/api/openapi.yaml` (API_*→SVC_*), migrations (TBL_*) |
| Dependency Graph | workspace `package.json` `@panchangpal/*` edges |
| Repository Health | file/LOC/package/migration counts |
| Technical Debt | grep of `TODO/FIXME/HACK/BLOCKED/[PRD FOLLOW-UP]/[ASSUMPTION]` |
| Documentation Drift | `Last Updated` timestamps across `.claude/` state files |
| Test Coverage | `*.test.ts(x)` files + `it()/test()` counts + pgTAP `plan(N)` |
| CI/CD | `.github/workflows/*.yml` jobs/gates |
| Blockers | `DASHBOARD.md` Blockers + ADR-033 + GURU_LIVE gate |
| Release Readiness | TDD Part 5 §10.1 go/no-go, checked against repo signals |
| Module Health | file / test-case / debt counts per module (backend/mobile/ai/design-system/docs/testing/infra) |
| AI Context Graph | doc-layer coverage (MRD/PRD/PDD/TDD/ADR) + impl/test presence per module |
| Decision Timeline | ADR dates + consequences (derived from the ADR log) |
| Risk Register | derived: active blockers + proposed ADRs + open release gates |
| Engineering Journal | `SESSION.md` sections + `git log` + per-commit `--stat` files |

## Honesty notes (internal tool, not marketing)

- **No live CI status or coverage %** — those need the GitHub API and a test run; this sandbox is
  offline. The dashboard shows the configured pipeline/gates and static test counts, and says so.
- **Technical Debt** counts include documented `[PRD FOLLOW-UP]`/`[ASSUMPTION]`/`BLOCKED` markers —
  many are intentional design deferrals (e.g. ADR-033), not defects. The kanban splits them by
  severity (BLOCKED→Critical, FIXME/HACK→High, TODO→Medium, PRD-FOLLOWUP/ASSUMPTION→Low) so you can
  triage; don't read the total as a bug count.
- **Module Health** shows test-case counts, not a fabricated coverage %. Live coverage runs in CI.
- **Risk Register** probability/impact are *inferred* from concrete signals (a critical blocker →
  High/High, a proposed ADR → Medium/Medium, etc.); owners read "unassigned" until set in the docs.
- **AI Context maturity** is layer coverage, not correctness — a module can be 100% specified and
  still `Blocked` (the Panchang Engine is exactly this: fully documented, compute blocked by ADR-033).
- `command-center.json` is a build artifact. Regenerate it in CI (or via `serve.mjs`) rather than
  committing stale data; add it to `.gitignore` if you prefer not to track it.

## Files

`generate.mjs` (repo parser → JSON) · `index.html` + `styles.css` + `app.js` (dashboard) ·
`serve.mjs` (static server + watch). No external dependencies (pure Node + browser).
