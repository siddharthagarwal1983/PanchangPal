# apps/backend — PanchangPal Supabase project

The Supabase backend: Edge Functions (`SVC_*`), SQL migrations (`TBL_*` + RLS), and
seed data. Layout per TDD Part 1 §4.

```
functions/            # Edge Functions = SVC_* (Deno/TypeScript)
  panchang/           # SVC_panchang — API_GET_TODAY, panchang detail, tithi engine
  ask-guru/           # SVC_ask_guru — RAG, grounded-or-silent, streamed
  notify-scheduler/   # SVC_notify_scheduler — due-notification sweep
  revenuecat-webhook/ # SVC_revenuecat_webhook — entitlement reconciliation
  sync/               # SVC_sync — offline mutation reconciliation
  account/            # SVC_account — anon→auth merge, delete, transfer
  content-ingest/     # SVC_content_ingest — RAG ingestion pipeline
  _shared/            # server-side shared (auth, logging, guardrails)
migrations/           # SQL migrations (TBL_* + RLS) — see docs/database/
seed/                 # seed data (traditions, festivals, rituals, flags)
tests/rls/            # RLS policy test-suite (pgTAP, §4.4 security gate)
```

**Function skeletons only.** Each `functions/<name>/` currently holds a README stating
its `API_*`/`FLOW_*` responsibility. No business logic is implemented in this task —
that is the Backend Foundation milestone. Functions are stateless, idempotent, and the
only place holding secrets / doing third-party egress (ADR-006).

**Migrations** are applied by CI from `apps/backend/migrations/` (TDD Part 1 §2.4;
DEC-022). The Supabase CLI config is at `supabase/config.toml`.
