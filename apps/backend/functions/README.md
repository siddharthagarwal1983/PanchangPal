# Edge Functions (`SVC_*`) — Backend Foundation

Supabase Edge Functions (Deno). Each is stateless, idempotent, secret-holding, and the
only place doing third-party egress (ADR-006). Structure per function:

- `index.ts` — the Deno handler (`Deno.serve`), wrapped by `_shared/auth.withHandler`
  (CORS + correlation id + structured logging + uniform `ERR_*` envelope, ADR-022).
- `logic.ts` — **pure**, Deno-free business logic (conflict rules, mapping, gating) so it
  runs under Vitest in CI (TDD Part 1 §3 #17). No `Deno.*` in this graph.
- `*.test.ts` — Vitest unit tests for the pure logic.

## Status (this increment)

| Function | State | Notes |
|---|---|---|
| `sync` | Logic implemented + tested | Per-kind conflict rules (§6.6); DB upserts wired via integration tests |
| `revenuecat-webhook` | Logic implemented + tested | HMAC verify (`_shared/crypto`) + event→entitlement mapping (F-4) |
| `account` | Logic implemented + tested | anon→auth merge (F-1), deletion gate (F-3), transfer |
| `panchang` | Skeleton + cache-key tested | ⚠️ **compute BLOCKED** — see `panchang/engine.ts` (undocumented astronomical algorithm; ADR-010) |
| `notify-scheduler` | Skeleton | Sweep + quiet-hours/caps/suppression + Expo send seams (ADR-020); depends on panchang for sunrise/tithi timing |
| `ask-guru` | SSE pipeline conformant | Confidence gate wired (`@panchangpal/ai`); needs the OpenAI adapters (live key) + ingested corpus |
| `content-ingest` | Skeleton | chunk→embed→upsert→cutover seams (Part 3 §3.5); needs the embedding adapter |
| `_shared` | Complete | env, supabase clients, errors, http/cors/sse, logging, auth, crypto |

## What each function still needs before production

- **DB upserts** against the documented unique constraints (integration-tested vs. a
  Supabase test project) for `sync`, `revenuecat-webhook`, `account`.
- **`panchang` engine** — the approved, reviewer-validated astronomical algorithm
  (blocked documentation gap, flagged to product/architecture).
- **`@panchangpal/ai` concrete OpenAI adapters** (GPT-5 mini + text-embedding-3-small),
  constructed server-side with `OPENAI_API_KEY`, plus the ingested corpus (`ask-guru`,
  `content-ingest`).
- **Rate limits + cost circuit-breaker** on `ask-guru` (Part 3 §8.4).

Secrets are server-only (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`REVENUECAT_WEBHOOK_SECRET`); never on device (ADR-030).
