# .github/workflows — CI/CD

GitHub Actions pipeline (TDD Part 1 §2.4/§3 row 18, ADR-024): lint/typecheck/test →
apply migrations (`apps/backend/migrations/`) → deploy Edge Functions → EAS Build/Submit
→ store distribution, plus Expo Updates (OTA) for JS-only fixes. CI gates include
accessibility (ADR-029), the RLS policy suite (§4.4), and the API-contract check.

**Placeholder** — workflows are authored in the "Configure GitHub Actions / CI" task
(next milestone item). This directory reserves the location.
