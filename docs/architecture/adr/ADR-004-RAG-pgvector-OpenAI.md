# ADR-004 — RAG with pgvector + OpenAI (Grounded-or-Silent)

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** AI / Architecture

---

## Context

Ask Guru answers questions about Hindu ritual and observance, where a fabricated specific costs disproportionate trust (MRD Risk §3; PRD P0 #4). The product principle is grounded-or-silent: the assistant must answer only from a reviewed content library and decline honestly when evidence is insufficient (TDD Part 1 §1.9; PDD §9.0). At v1 the content corpus is small and reviewer-curated, so retrieval — not model size — is the accuracy lever. The team wants transactional consistency between content and its embeddings and minimal operational surface.

Relevant sources: TDD Part 1 §1.9, §2.10, §3 Stack rows 8–9, §6 ADR-004; Decision Log DEC-005.

---

## Decision

Implement **Retrieval-Augmented Generation over pgvector** (embeddings stored in the same PostgreSQL as the content), with OpenAI embeddings and generation reached **behind an LLM adapter** (ADR-011). The Ask Guru Edge Function classifies scope, embeds the query, runs a similarity search over the reviewed `CONTENT_CHUNK` corpus, and **only generates when retrieval confidence clears a tunable threshold**; otherwise it declines. All model access is server-side (ADR-006).

---

## Alternatives Considered

- **Dedicated vector database (Pinecone/Weaviate).** Rejected for v1: an extra vendor, extra cost, and a content↔vector sync problem unjustified at the launch corpus size. Retained as a documented scale trigger.
- **Base LLM with no retrieval.** Rejected: violates the grounding acceptance criterion — the model would answer ungrounded.

---

## Consequences

**Positive.** One datastore for content and vectors gives transactional content↔embedding consistency and lower cost/ops; grounding is enforceable and testable (refusal test set, groundedness metrics).

**Trade-offs.** pgvector index parameters (HNSW/IVFFlat) must be tuned as the corpus grows; retrieval quality depends on corpus curation.

**Operational.** Confidence threshold and optional groundedness post-check are calibrated with eval data in TDD Part 3 (F-6/F-16).

---

## Dependencies

**Depends on** ADR-003 (Supabase/PostgreSQL), ADR-006 (Edge Functions), ADR-011 (LLM/embedding adapter + models).
**Related** ADR-019 (streaming responses), ADR-017 (adapter pattern).

---

## Affected Documents

- TDD Part 1 §1.9, §2.10, §3 (Stack rows 8–9), §6 ADR-004
- Decision Log DEC-005 (Grounded-or-Silent AI)
- AI/RAG subsystem: corpus schema, chunking, ingestion, eval harness (TDD Part 3)

---

## Review Trigger

Revisit if corpus/QPS growth pushes retrieval latency past the AI NFR (NFR-05), or if multi-tenant vector needs emerge, justifying a dedicated vector store.
