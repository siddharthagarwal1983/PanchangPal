# SESSION.md

# PanchangPal — Current Session

Version: 1.0.0
Last Updated: 2026-07-12 03:40

Purpose: records the current working session. Not permanent project memory.

---

# Session Objective

Complete all Backend Foundation work that is INDEPENDENT of the Panchang astronomical
calculations, keep the engine as an abstract provider (only blocked component), and create the
"Canonical Panchang Engine Decision" architecture work item (ADR + MRD/PRD/PDD/TDD).

---

# Work Completed

Independent backend work (all 9 requested items):
1. OpenAI providers behind the AI abstraction: OpenAiLLMProvider (SSE stream) + OpenAiEmbeddingProvider (1536), prompts registry, scope classifier + groundedness (fail-safe). Tested with mock fetch.
2. DB repositories + Supabase wiring: SyncRepository, BillingRepository (F-4), AccountRepository (F-1/F-3), NotificationRepository, ContentRepository (pgvector RPC), aiStores (Pg rate-limit/cost). All SVC_* handlers wired to repos.
3. DB integration tests (pgTAP): idempotent upserts, household entitlement, merge reassignment, AI helpers — apps/backend/tests/integration/.
4. Ask Guru rate limiting: pure sliding-window + in-memory/Postgres stores (anon tighter). Tested.
5. Cost monitoring + circuit breaker: cost estimator + rolling-window ledger + breaker (opens before ceiling). Tested. Migration for ai_config/ai_rate_limit/ai_cost_ledger + atomic RPCs.
6. Remaining Edge Function wiring: ask-guru full pipeline (rate→cost→scope→embed→retrieve→gate→stream→sources→groundedness); content-ingest (chunk→embed→upsert); notify-scheduler (engine-independent sweep).
7. CI/CD: Vitest wired (root config), db-tests job runs RLS + integration pgTAP on pgvector image; mobile jest step.
8. notify-scheduler depends ONLY on the PanchangEngine interface (no calculation assumed).
9. Engine-dependent tests marked it.skip with TODO(ADR-033); no fake data.

Panchang engine: refactored to abstract PanchangEngine interface + unimplementedPanchangEngine (fails closed). The ONLY blocked component.

Architecture work item "Canonical Panchang Engine Decision": ADR-033 (Proposed) + docs/architecture/canonical-panchang-engine/{README,MRD,PRD,PDD,TDD}.md covering ephemeris, ayanamsa, traditions, methodology, validation dataset, tolerances, provider architecture. ADR index updated (33 ADRs).

---

# Validation

34 backend .ts files; 10 Vitest suites (+2 skipped engine tests); RLS + integration pgTAP; 13 migrations; packages/ai 10 modules. JSON/YAML valid; pure test graph Deno-free. No live run (offline sandbox) — runs in CI.

---

# BLOCKER (only one)

⛔ Canonical Panchang Engine (ADR-033, Proposed). Astronomical algorithm undocumented; do NOT implement until ratified. Blocks SVC_panchang compute + sunrise/tithi notifications only.

---

# Recommended Next Task

Design System & Component Library (packages/ui CMP_* + tokens from PDD Part 3 §6), then mobile feature slices (MOD_*). In parallel (owner-driven): ratify ADR-033 Part B to unblock the engine.
