# .github/workflows — CI/CD

GitHub Actions pipeline (TDD Part 1 §2.4/§3 row 18, ADR-024). Three workflows:

| File | Trigger | Purpose |
|---|---|---|
| `ci.yml` | PR → main, manual | Release-blocking PR gates: lint/typecheck → unit/component/a11y → API/zod contract → RLS + DB integration (pgTAP) → AI eval subset → secret + dependency scan. |
| `cd.yml` | push → main, manual | Delivery: staging migrations → deploy Edge Functions → Maestro E2E → EAS build/submit → internal distribution. Production is a **manual** `workflow_dispatch` gated by the `production` Environment (go/no-go §10). |
| `ota.yml` | manual (channel: staging\|production) | Expo Updates (JS-only) for fast fixes (TRISK-10: no native/config changes via OTA). |

CI gates include accessibility (ADR-029), the RLS policy suite (§4.4), and the API-contract check.

## Status (2026-07-12)

Workflows are authored and **hardened** (least-privilege `permissions`, pinned toolchain from
workflow `env`, pnpm install retries, `db-tests`/`security-scan` toolchain setup, `preflight`
fail-fast on deploy jobs, step summaries). Several CD/OTA deploy **steps are intentional scaffolds
(`echo`)** until the Beta Readiness milestone provisions the Supabase projects, EAS, and stores.

See:
- `docs/devops/GITHUB_ACTIONS_AUDIT.md` — per-workflow audit + findings.
- `docs/devops/DEPLOYMENT_READINESS.md` — secrets/environments/go-no-go.
- `docs/devops/SECRETS_MATRIX.md` — where each secret lives.
- `scripts/preflight.sh` — deployment preflight validator.
