# tests — cross-package E2E

Maestro end-to-end flows mapping to `FLOW_*` (TDD Part 1 §4, §3 Stack row 17), plus
shared fixtures. `[ASSUMPTION T3]` Maestro for E2E (simpler than Detox for a solo dev).

```
flows/               # Maestro flow files = FLOW_* (A1…F1)
```

Placeholder — E2E flows are authored in the testing task. Unit/component tests live
next to their code (`*.test.tsx`); the RLS policy suite is at
`apps/backend/tests/rls/` and AI eval harness in TDD Part 3.
