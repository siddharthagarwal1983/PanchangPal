# OWASP Mobile Top 10 Review — PanchangPal

**Version:** 1.0.0
**Date:** 2026-07-26
**Scope:** TDD Part 5 §5.2 `[MANDATORY]` — "OWASP Mobile Top 10 review checklist before launch".
**Reviewed against:** `main` @ `59fb72f`, plus PR #57 (auth session persistence).
**Reviewer:** engineering (single-founder project; §5.2's `[RECOMMENDATION]` third-party pen test is
**not** a substitute for this and remains outstanding).

This review uses the **OWASP Mobile Top 10 (2024)** category set. §5.2's parenthetical — "secure
storage, transport, auth, platform interaction, code quality" — is the 2016 phrasing; the 2024
categories cover the same ground with supply chain and privacy split out, so both are satisfied.

---

## How to read this

Each category records what was **checked**, with `file:line` evidence, and a status:

| Status | Meaning |
|---|---|
| ✅ | Control present and verified |
| ⚠️ | Gap that is bounded — recorded, not launch-blocking on its own |
| ⛔ | Launch blocker |

**A finding with no evidence line was not verified.** Where a control could only be confirmed on a
device or in a live environment, that is stated rather than assumed — the repeated lesson of this
project is that a documented control and a working one are different things.

---

## Summary

| # | Category | Status |
|---|---|---|
| M1 | Improper Credential Usage | ✅ **fixed this review** (was ⛔) |
| M2 | Inadequate Supply Chain Security | ✅ **closed this review** (was ⚠️) |
| M3 | Insecure Authentication / Authorization | ✅ **fixed this review** (was ⛔ — see the correction below) |
| M4 | Insufficient Input / Output Validation | ⚠️ |
| M5 | Insecure Communication | ✅ |
| M6 | Inadequate Privacy Controls | ✅ |
| M7 | Insufficient Binary Protections | ⚠️ (accepted) |
| M8 | Security Misconfiguration | ⚠️ |
| M9 | Insecure Data Storage | ✅ **fixed this review** (was ⛔) |
| M10 | Insufficient Cryptography | ✅ |

**Found and fixed during this review:** the auth session was never persisted (M1/M9), which cost
every user their identity on every app restart. See PR #57.

**Found and recorded, not a security finding:** the offline queue is never drained, so the app is
not offline-first in practice. Tracked separately as a launch blocker — it is a missing feature,
not a vulnerability.

---

## M1 — Improper Credential Usage · ✅ (was ⛔)

**Finding (fixed, PR #57).** `supabaseClient.ts` requested `persistSession: true` and passed no
`storage` adapter. React Native has no `localStorage`, so auth-js falls back to an in-memory store —
the flag asked for persistence and got memory.

Because the app is anon-first, the consequence was not a lost login but a **lost identity**:

```ts
// src/store/session.ts:42-43
const existing = await authRepository.restore();          // → null on every cold start
const session = existing ?? (await authRepository.signInAnonymously());   // → a NEW uid
```

Every restart minted a fresh anonymous user, orphaning that person's profile, household membership,
streak, ritual completions, personal dates and conversations.

**Fixed** by `src/data/secureSessionStorage.ts` — the session now persists to Keychain (iOS) /
Keystore-backed encrypted preferences (Android) via `expo-secure-store`, which was already a
declared dependency and config plugin wired to nothing.

**Proven, not asserted.** `FLOW_AUTH_SESSION_PERSISTENCE` sets a server-authoritative preference,
restarts the process, and asserts it survived. Run against the same code with the fix reverted, the
flow **fails** (run 30203256764); with the fix, 5/5 green (run 30203262501).

**Other credential handling — verified clean:**
- Only `EXPO_PUBLIC_*` values reach the device (`app.config.ts:43-54`); no service-role key, no
  OpenAI key, no webhook secret (ADR-030).
- The webhook secret is server-side only and used for HMAC verification
  (`_shared/crypto.ts:6-26`).

---

## M2 — Inadequate Supply Chain Security · ⚠️

**Present:** secret scanning (gitleaks) and a dependency audit run on every PR
(`ci.yml:204-227`); a committed `pnpm-lock.yaml`; the E2E/native build path pins the project's own
Expo CLI deliberately (`e2e.yml`, "pnpm exec, NOT pnpm dlx").

**Gaps found — all three closed in this review (B6.4):**

1. ~~**No SBOM.**~~ §5.2 names it `[MANDATORY]` and nothing generated one. **Closed:** CycloneDX via
   `@cyclonedx/cdxgen` (pinned, pnpm-aware — `cyclonedx-npm` reads an npm tree and this is a pnpm
   workspace), uploaded as a 90-day artifact per CI run. Deliberately **not** a gate: an SBOM's value
   is answering "were we exposed to X" on the day X is disclosed, which needs the inventory for a
   build that already shipped; gating a PR on it would only prove the generator ran.
2. ~~**No Renovate or Dependabot.**~~ Dependency updates were manual and unprompted — the mechanism
   by which the mmkv-v2 / New Architecture incompatibility survived two milestones, since nothing
   surfaced that a newer major existed and the failure was silent at runtime. **Closed:**
   `.github/dependabot.yml`, weekly grouped npm + monthly grouped github-actions. Grouped
   deliberately: a single-founder project cannot absorb twenty PRs a week, and ungrouped output gets
   ignored wholesale — which is worse than none, because it looks like coverage. Expo SDK and
   react-native packages are ignored, since those upgrade together via `expo install --fix` and a
   lone bump produces a build that resolves and then fails natively.
3. ~~**Unpinned tooling fetched at build time.**~~ Four steps ran `pnpm dlx eas-cli@latest`, so the
   tool that builds and **signs** the release artifact was never the one any previous run used, and a
   compromised or merely broken publish would land straight in the release path. **Closed:** pinned
   to `21.2.0` at all four call sites. `e2e.yml` had already made this argument for the Expo CLI
   ("pnpm exec, NOT pnpm dlx") after a `@latest` fetch broke the config loader; this applies the same
   rule to the release path.

**Also noted (hygiene, not security):** `@tanstack/query-async-storage-persister` is declared and
imported by nothing. `expo-secure-store` was in the same state until PR #57 — an unused dependency
is indistinguishable from a control that was intended and never wired, which is exactly what M1 was.

---

## M3 — Insecure Authentication / Authorization · ✅ (was ⛔)

### ⚠️ Correction to this review

**This category was first recorded as ✅, and that was wrong.** The finding was drawn from
`SVC_sync`, which derives identity correctly, and generalised to "the client never asserts its own
identity to the server" without checking the other six functions. `SVC_account` did the opposite,
and it is the function that deletes accounts and reassigns ownership.

The error is worth recording rather than quietly editing: **a control verified in one place was
reported as a property of the system.** That is the same reasoning error as trusting a status doc —
one instance, generalised. It was caught only because B6.2 went to add an `export` action to that
same function.

### The defect (fixed in B6.2)

`withHandler` proves only that a bearer token is **present** (`_shared/auth.ts:18-23`), and
`SVC_account` runs with the **service role** — so RLS is not a backstop. It then took the acting
identity from the **request body**:

```ts
case 'delete': { const userId = body.user_id ?? '';                          // account/index.ts:44
case 'merge':  { const authUid = body.auth_uid; const anonUid = body.anon_uid;   // :25-26
```

Anonymous sign-in is enabled (`supabase/config.toml:52`), so anyone can mint a valid JWT for free;
`verify_jwt` proves a token is *a* valid token, never *whose*. Two exploits followed:

| Request | Effect |
|---|---|
| `POST /account/delete {"user_id": "<victim>"}` | schedules deletion of any account |
| `POST /account/merge {"anon_uid": "<victim>", "auth_uid": "<attacker>"}` | `UPDATE … SET user_id = attacker WHERE user_id = victim` across every owned table (`accountRepo.ts:39-43`) — **account takeover**, after which the attacker reads the victim's rows through ordinary RLS |

**Victim uids are not secret.** `household_member.user_id` is returned by the household query
(`householdRepository.ts:23`), so any household member could take over a co-member's account — and
households are the product's sharing primitive.

**Both actions were also broken for legitimate use**, which is why nothing surfaced it: the client
never sent `user_id` or `auth_uid` at all, so `delete` called `scheduleDeletion('')` and `merge`
always returned 422. The endpoint was simultaneously non-functional and exploitable.

### The fix

Every action now derives the caller via `repo.currentUserId(ctx.jwt)` and ignores any body uid.
`merge` additionally requires the anonymous session's **access token** as proof of ownership — a uid
is a claim, not proof, and the anon side is by definition not the caller's current identity.

`authorization.test.ts` asserts the invariant directly — *no uid in a request body may influence
which rows this function touches* — with a hostile body per action, and was **proven to fail** by
reintroducing `body.user_id ?? callerUid`.

### Verified clean

- **RLS is the authorization boundary** (ADR-018), gated in CI by a pgTAP policy suite.
- **`SVC_sync` derives the user from the JWT** (`sync/index.ts:37`) and the body cannot redirect a
  write to another user. This remains true — it was the generalisation that was wrong, not the
  observation.
- **Entitlement is read-only on device.** No `src/data` repository writes the `entitlement` table;
  the RevenueCat webhook is the sole writer (ADR/PROJECT_MEMORY, migration 20260712000060).
- **Privileged household operations run server-side** — mint/accept invite and member changes go
  through SVC_household rather than direct table writes (`householdRepository.ts:4,87-97`).
- **Feature flags fail closed** — loading, error, absent key or non-boolean all read `false`, so
  post-v1 scope cannot leak on.

**Not verifiable here:** SVC_household is still unimplemented, so the invite-token accept path
(`panchangpal://invite/{token}`) has no server-side expiry/single-use enforcement to review yet.
Flagged for whenever that function lands — an invite token is a capability URL.

---

## M4 — Insufficient Input / Output Validation · ⚠️

**ADR-030 states "All inputs are validated (zod) at every boundary." That is not true of the Edge
Functions.** Zero of the seven import `@panchangpal/api`, where the zod contracts live. Validation
is hand-rolled and shallow:

```ts
// sync/index.ts:32 — the array exists; the shape of each element is unchecked
if (!body?.idempotency_key || !Array.isArray(body.mutations)) { ... }

// sync/index.ts:50 — an unchecked cast into the DB write
await repo.completeRitual(userId, m.payload as unknown as RitualCompletePayload);
```

**Correctly scoped: this is not injection and not privilege escalation.** `completeRitual` builds a
parameterized PostgREST call (`_shared/db/syncRepo.ts:28-41`), `user_id` is server-derived, RLS
bounds the blast radius to the caller's own rows, and unknown mutation kinds are logged and ignored
(`sync/index.ts:64`).

**What it does expose:** `local_date`, `ritual_id`, `source` and `client_id` reach the DB unvalidated,
so a user can post completions for arbitrary dates **for themselves** — inflating their own streak,
which is the North Star input (EVT_017 aggregates). Malformed types surface as 500s rather than the
calm 422 that §8.2's degradation policy expects.

`ask-guru` does bound its one free-text input (`ask-guru/index.ts:33`, length ≤ 500).

**Recommendation:** import the existing zod contracts at the Edge Function boundary. They already
exist and are already gated against the OpenAPI spec by the restored contract test — they are simply
not applied where the untrusted data arrives.

---

## M5 — Insecure Communication · ✅

- No cleartext endpoint anywhere in mobile, backend, or shared source (`http://` appears only in
  test fixtures, localhost, and XML namespace URIs).
- All traffic is Supabase HTTPS + the SSE adapter over the same origin.
- The Ask Guru client streams **only** via the server SSE adapter and never contacts an LLM
  directly.

**Not implemented, and accepted:** no certificate pinning. For a managed-Expo app against a managed
Supabase endpoint, pinning trades a real outage risk (certificate rotation bricking installed apps)
for protection against an attacker who already controls the device trust store. Recorded as a
deliberate decision rather than an oversight.

---

## M6 — Inadequate Privacy Controls · ✅

- **Analytics is PII-free by construction** (B4.2): props are primitives only — objects and arrays
  are dropped at the boundary, which is how an error or server response would otherwise carry user
  content into the store — and `user_pseudo_id` is a device-minted random UUID never derived from
  the auth uid.
- **`analytics_event` is insert-only for clients**, gated by five pgTAP assertions and verified
  against hosted staging.
- **Errors carry no message text.** An unrecognised error maps to `ERR_UNKNOWN` rather than echoing
  its message; `componentStack` is never forwarded; the server telemetry seam deliberately omits the
  message because a library's error text routinely contains a query or a token.
- **No PII in logs.** Seven `console.*` calls in the entire app; none logs a session, token, email
  or user object.
- **No permissions are requested** in `app.config.ts` — consistent with location being ADR-033-blocked
  and notifications deferred.

---

## M7 — Insufficient Binary Protections · ⚠️ (accepted)

- Hermes is mandatory and pinned (`app.config.ts:26`), so the shipped JS is `.hbc` bytecode rather
  than readable source — a meaningful raise over a plain JS bundle, though not an anti-tamper control.
- **No obfuscation, no root/jailbreak detection, no anti-debug.**

**Accepted, with reasoning.** The client holds no secret worth extracting (M1 verified: public anon
key only), the server is authoritative for every value that matters (entitlement, streak, panchang),
and receipts are validated server-side. Binary hardening would protect nothing the RLS boundary does
not already protect. Revisit only if a client-side secret is ever introduced — which ADR-030 forbids.

---

## M8 — Security Misconfiguration · ⚠️

- ✅ **preflight fails closed** on missing secrets across all tiers (exit 1, proven by running it).
- ✅ **No secrets in the repo**; gitleaks gates every PR.
- ✅ **A production release is blocked** when Sentry is unconfigured (`release-build.yml`).

**Gaps — both in the generated Android manifest, which is not committed (`prebuild` regenerates it),
so neither is currently controlled by anything in this repo:**

1. **`android:allowBackup` is not set**, so it defaults to `true`. App-private files — the MMKV
   store (unencrypted: ritual sessions, the analytics pseudonymous id, the onboarding flag) — become
   eligible for Android Auto Backup. The SecureStore ciphertext is not usefully exposed, since its
   Keystore key is device-bound and not backed up, but the MMKV contents are.
2. **No `networkSecurityConfig`.** API 28+ defaults to denying cleartext, so this is defence in
   depth rather than an open hole — but it is a default being relied upon, not a decision being
   enforced.

Both are fixable with an `expo-build-properties` config-plugin entry, which would also place them
under review rather than leaving them to a template default.

---

## M9 — Insecure Data Storage · ✅ (was ⛔)

**Fixed this review** — see M1. The session credential now lives in Keychain/Keystore, not memory
and not the unencrypted MMKV store.

**What remains in the unencrypted MMKV store**, reviewed deliberately (`createDeviceStore` callers):

| Data | File | Sensitivity |
|---|---|---|
| Ritual session progress | `ritualSessionRepository.ts:33` | Low — step index for today's ritual |
| Analytics pseudonymous id | `pseudoId.ts:28` | Low — random UUID, tied to no identity |
| Onboarding-complete flag | `onboardingRepository.ts:26` | None — a boolean |

None is a credential and none is PII. **This is the correct split**: durable-but-cheap state in MMKV,
credentials in the keystore.

**The adapter's own failure modes are tested** rather than assumed: chunking above SecureStore's
2048-byte limit, count-written-last so a torn write leaves nothing partially readable, stale-chunk
deletion so a shorter session leaves no ciphertext tail, and a loud, inspectable degrade-to-memory
(`getSessionStorageBackend()`).

---

## M10 — Insufficient Cryptography · ✅

- **No hand-rolled cryptography.** The one HMAC path uses Web Crypto with a **constant-time compare**
  (`_shared/crypto.ts:19` `timingSafeEqual`) — correct for signature verification.
- **No weak hashes** (no MD5/SHA-1) and no `crypto-js`.
- `Math.random()` appears once (`ProductionGuruTransport.ts:73`) as a fallback behind
  `crypto.randomUUID()`. It feeds an **idempotency key**, not a credential or a token, so weak
  randomness costs collision probability rather than security. Acceptable; noted for completeness.
- Encryption at rest is delegated to platform keystores rather than implemented.

---

## Outstanding after this review

| Item | Category | Owner |
|---|---|---|
| ~~SBOM generation~~ | M2 | ✅ closed — CycloneDX via pinned cdxgen, uploaded per CI run |
| ~~Renovate/Dependabot config~~ | M2 | ✅ closed — grouped weekly npm + monthly actions |
| ~~Pin `eas-cli` instead of `@latest`~~ | M2 | ✅ closed — pinned to 21.2.0 in all four call sites |
| zod contracts applied at Edge Function boundaries | M4 | engineering |
| `allowBackup=false` + explicit network security config | M8 | engineering |
| Invite-token expiry/single-use review | M3 | blocked on SVC_household |
| Third-party pen test (§5.2 `[RECOMMENDATION]`) | all | owner (cost) |

**Not in this review, recorded separately:** the offline queue is never persisted, never drained and
never dequeued, so the app is not offline-first in practice. It is a missing feature rather than a
vulnerability, and is tracked as a launch blocker in its own right.
