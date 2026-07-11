# apps/mobile — PanchangPal Expo app

React Native + Expo (Expo Router), feature-sliced per TDD Part 1 §2.3/§4. **Skeleton
only** — no features are implemented yet.

```
app/                 # Expo Router routes = SCR_* surfaces
src/
  features/          # one slice per tab/area: today, calendar, ask-guru, you, onboarding, auth
  domain/            # domain services (RitualProgress, Streak, Household, PanchangView...)
  data/              # supabase-js + TanStack Query hooks + @panchangpal/api clients
  store/             # Zustand stores (session, offline queue, prefs)
  a11y/  i18n/        # accessibility + localization utilities
  analytics/         # EVT_* client (envelope §11.1)
app.config.ts        # Expo config, deep-link scheme panchangpal://
```

**Dependency direction (TDD §5):** `features → domain → data → packages`. UI never
imports the data layer; domain never imports UI; the app **never** imports the OpenAI
SDK or a service-role key (server-only, ADR-006/011). Runtime deps (expo, react-native,
zustand, @tanstack/react-query, supabase-js) are added when the app is initialized with
the Expo toolchain.
