# ADR-019 — Streaming AI Responses

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** AI / Mobile

---

## Context

Ask Guru must feel responsive despite LLM generation latency. The NFR is a first streamed token in under 2 seconds, with a full short answer well under the hard cap (TDD §8 NFR-05). A blocking request that returns only when generation finishes would violate the perceived-performance and calm-UX goals, and would make timeouts feel like dead ends.

Relevant sources: TDD Part 1 §1.9, §2.10, §7.5–7.6, §8 (NFR-05).

---

## Decision

**Stream AI responses** token-by-token from `SVC_ask_guru` to the client. The Edge Function classifies scope and retrieves grounding first; when grounded, it streams generation so the first token renders under 2 seconds, followed by visible sources. An optional groundedness post-check can downgrade a weak answer. On transient AI errors, one automatic retry is allowed, then a calm user-driven retry — never an auto-loop (cost control) and never fabricated content on timeout (`ERR_AI_TIMEOUT`/`ERR_AI_ERROR`).

---

## Alternatives Considered

- **Blocking (non-streamed) responses.** Rejected: misses the first-token NFR and makes latency and errors feel worse.

---

## Consequences

**Positive.** Meets NFR-05; the assistant feels responsive; errors degrade to a calm retry rather than a dead end.

**Trade-offs.** Streaming adds client and Edge Function complexity (partial rendering, cancellation, error mid-stream).

**Operational.** First-token latency and cost/query are first-class AI metrics (PDD §9.9); embeddings and evergreen answers are cached to cut latency/cost (ADR-004 improvement).

---

## Dependencies

**Depends on** ADR-004 (RAG), ADR-006 (Edge Function), ADR-011 (streaming model).
**Related** ADR-023 (AI observability).

---

## Affected Documents

- TDD Part 1 §1.9, §2.10, §7.5–7.6, §8 (NFR-05)
- `ERR_AI_TIMEOUT`, `ERR_AI_ERROR`; `EVT_030/031`

---

## Review Trigger

Revisit if a provider or transport cannot meet the streaming first-token NFR, or if a non-streamed mode becomes preferable for a new answer type.
