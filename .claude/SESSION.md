# SESSION.md

# PanchangPal — Current Session

Version: 1.0.0
Last Updated: 2026-07-12 04:30

Purpose: records the current working session. Not permanent project memory.

---

# Session Objective

Implement EXACTLY ONE milestone: Mobile MVP Milestone 1 — Application Shell. Architecture-first;
no feature screens; do not touch ADR-033 / the PanchangEngine interface; stop after M1.

---

# Work Completed (Milestone 1 — Application Shell)

Resolved two spec-vs-architecture conflicts with the user before building (both → canonical):
tabs = Today/Calendar/Guru/You (not Home/Festivals/Settings); auth = anonymous-first + Apple/
Google/email-OTP (not password login/register/forgot — those don't exist in the contracts).

- Design tokens: packages/design-tokens populated with PDD §6 values (light+dark color, type,
  spacing, radius, motion) + getTheme(). ThemeProvider/useTheme moved into @panchangpal/ui.
- Shared UI (11 CMP_*): Text, Screen (loading/empty/error/offline states), AppHeader,
  BottomTabBar, Spinner, Skeleton, EmptyState, ErrorState, OfflineBanner, AuthButton,
  BrandLogo/SplashBackdrop — token-only, typed, a11y (roles/labels/state, ≥44/48).
- Auth data layer: supabaseClient (public keys only), AuthRepository (anon, Apple/Google/
  email-OTP, restore, logout, merge via API_*), STORE_session wired to the repository, useOnline.
- Navigation: root layout + AppProviders + app ErrorBoundary + expo-router per-route boundary;
  splash bootstrap (app/index.tsx); (onboarding) sign-in + verify-otp; (tabs) custom
  CMP_BOTTOM_TAB_BAR; guards (resolveRootRoute/requiresAuth/isEntitled); deep-link table; 4 tab
  shells using Screen + AppHeader.
- i18n: en-US keys for every shell string; typed t().
- Tests (3 suites): shell components (a11y), navigation guards, session store (auth flow +
  restore + merge + logout). jest-expo configs for mobile + ui; CI runs both.

---

# Architecture Compliance

No architecture changes. Frozen IA + auth model honored. PanchangEngine interface untouched;
ADR-033 not modified. No astronomical calculations; no MockPanchangProvider needed (shell needs
no panchang data). No business logic in screens (repositories/stores/guards). Tokens-only; no
hardcoded hex/type; localized strings; loading/empty/offline/error states on every screen.

---

# Validation

11 CMP_* components, 11 app routes, 17 mobile src modules, 3 test suites. No hardcoded hex in
ui/app source (grep clean). JSON valid. No live run (offline sandbox) — tsc/jest run in CI.

---

# Remaining Work / Blockers

Milestone 1 complete. Blocker unchanged: ⛔ Canonical Panchang Engine (ADR-033, Proposed) —
does NOT block the shell. Native provider-token acquisition (Apple/Google) is stubbed pending the
auth-native task. Deferred: full onboarding slides, MMKV onboarding-completion persistence.

---

# STOP

Milestone 1 is complete. Do NOT begin Milestone 2. Awaiting review + approval.
Recommended next milestone: Milestone 2 — Today (MOD_today) shell + non-panchang parts
(streak/checklist), with the panchang view showing "temporarily unavailable" until ADR-033.
