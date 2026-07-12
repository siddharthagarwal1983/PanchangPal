# SESSION.md

# PanchangPal — Current Session

Version: 1.0.0

Last Updated: 2026-07-12 02:55

Purpose:
This document records the current working session. It is **not** permanent project memory.

---

# Session Objective

Backend Foundation — begin implementing the SVC_* Edge Functions against the API_* contracts (TDD Part 2 §5) and the AI/RAG subsystem (TDD Part 3). Read Part 3 first; flag any missing specs.

---

# Work Completed (first increment)

- Read TDD Part 3 (AI/RAG): retrieval config, F-6/F-16 thresholds, chunking, prompt/config registries, SSE contract — all specified; no blocking AI-spec gaps.
- `_shared` core (Deno + Vitest-safe): env, supabase clients (service + user), ERR_* envelope + AppError, http/cors/sse, structured logging + correlation id, auth/withHandler boundary, HMAC crypto.
- Fully-specified DB functions with PURE logic + Vitest tests:
  - `sync` — per-kind conflict rules (§6.6): client-authoritative daily completion, checklist union, personal-date LWW+tombstone, longer-streak-wins.
  - `revenuecat-webhook` — HMAC verify + event→(subscription, entitlement) mapping at household grain (F-4).
  - `account` — anon→auth merge (F-1), deletion gate (F-3), grace window, transfer.
- Conformant skeletons + flagged seams: `panchang` (cache-key tested; engine BLOCKED), `notify-scheduler` (sweep/quiet-hours/Expo seams), `ask-guru` (SSE pipeline + confidence gate wired), `content-ingest` (chunk→embed→upsert seams).
- `packages/ai` fleshed out: LLMProvider/EmbeddingProvider adapters, AI config registry (§8A defaults), retrieval confidence gate (§4.4, tested), scope/refusal taxonomy.
- Vitest wired: root vitest.config.ts (alias + include), root `test` script, CI updated (vitest + mobile jest steps).

---

# Files Created / Modified

Created ~28: apps/backend/{deno.json, functions/_shared/*, functions/{sync,revenuecat-webhook,account,panchang,notify-scheduler,ask-guru,content-ingest}/*}, packages/ai/src/{providers,config,retrieval,scope,retrieval.test}.ts, vitest.config.ts.
Modified: package.json (vitest), .github/workflows/ci.yml, packages/ai/src/index.ts, apps/backend/functions/README.md; .claude state files.

---

# ⚠️ BLOCKER / GAP (needs owner input)

**Panchang astronomical engine is undocumented.** ADR-010 mandates a deterministic engine validated vs Drik/mPanchang, but the actual algorithm (ephemeris; tithi/nakshatra/yoga/karana; sunrise/sunset; muhurta; Rahu Kaal) is NOT specified in any MRD/PRD/PDD/TDD. Not invented (a wrong tithi breaks trust, MRD Risk §1). `panchang/engine.ts` is an explicit blocked seam; `panchang` + `notify-scheduler` (sunrise/tithi timing) are gated on it. Needs the approved algorithm/ephemeris source + reviewer-validation harness.

---

# Validation

- 7 handlers use Deno.serve; pure logic/test graph has ZERO Deno.* usage (Vitest-safe). 5 test files (sync, rc, account, panchang cacheKey, ai retrieval).
- JSON/deno.json valid; CI api-contract → vitest, unit job runs vitest + mobile jest.
- No live run: sandbox offline (no node_modules/vitest). Tests + TS run in CI.

---

# Recommended Next Task

Continue Backend Foundation: (1) resolve the panchang-engine gap with the owner; (2) add the concrete OpenAI adapters (GPT-5 mini + text-embedding-3-small) in packages/ai with OPENAI_API_KEY; (3) wire the DB upserts (sync/webhook/account) + integration tests vs a Supabase test project; (4) add ask-guru rate limits + cost circuit-breaker (§8.4).
