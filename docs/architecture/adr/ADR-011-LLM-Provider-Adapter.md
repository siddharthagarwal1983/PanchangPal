# ADR-011 — LLM Provider Adapter (GPT-5 mini + text-embedding-3-small)

**Status:** Accepted (resolves F-20)
**Date:** 2026-07-11
**Decision Owner:** AI / Architecture

---

## Context

The PRD left the AI vendor open and flagged cost as a top risk (MRD Risk §2). Ask Guru answers from a small, reviewer-curated corpus with grounded output (ADR-004), so a frontier model is not required for accuracy — but the choice must remain swappable, and the design must support the first-token < 2 s NFR and a bounded AI cost per weekly active user (NFR-05/NFR-16).

Relevant sources: TDD Part 1 §1.9, §3 Stack row 9, §6 ADR-011, §10.2; Decision Log DEC-006, DEC-007.

---

## Decision

Access all LLM and embedding capability through **`LLMProvider` and `EmbeddingProvider` adapters** in `packages/ai`. The initial concrete implementation is **OpenAI GPT-5 mini** for generation (streaming) and **OpenAI `text-embedding-3-small` (1536 dimensions)** for embeddings, fixing `content_chunk.embedding` at `vector(1536)` for launch. All access is server-side (ADR-006). Vendor or model changes are configuration changes plus, for embeddings, a corpus re-embed step — no caller code changes.

---

## Alternatives Considered

- **GPT-5 full.** Deferred behind the adapter: higher cost/latency, unjustified for short grounded answers.
- **Anthropic / Google Gemini.** Viable and reachable via the same adapter; not the launch default.

---

## Consequences

**Positive.** Model/vendor are swappable via config without touching callers; launch cost/latency fit the grounded-answer workload and the AI-cost ceiling.

**Trade-offs.** A model or embedding change requires re-embedding the corpus (bounded by corpus size); the embedding dimension is fixed at 1536 for launch.

**Operational.** Embedding dimension is a schema commitment; upgrades are a config + re-embed migration.

---

## Dependencies

**Depends on** ADR-004 (RAG), ADR-006 (server-side), ADR-017 (adapter pattern).
**Related** ADR-019 (streaming).

---

## Affected Documents

- TDD Part 1 §1.9, §3 (Stack row 9), §6 ADR-011, §10.2/§10.6 (F-20 resolved)
- Decision Log DEC-006 (Provider-Agnostic AI Layer), DEC-007 (GPT-5 mini default)
- AI/RAG subsystem (TDD Part 3); `content_chunk.embedding vector(1536)`

---

## Review Trigger

Revisit on grounded-answer quality below the helpfulness KPI (PDD §9.9), embedding-recall issues, or a cost/quality shift favoring another model.
