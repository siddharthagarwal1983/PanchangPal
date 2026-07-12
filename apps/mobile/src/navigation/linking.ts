/**
 * Deep-link configuration (TDD Part 4 §3.3). Scheme panchangpal:// mapped to routes with
 * guaranteed valid back-stacks (FLOW D4). Params are zod-validated at the screen; invalid/
 * expired tokens route to a graceful state (ERR_INVITE_EXPIRED). Expo Router derives most
 * linking from the file tree; this documents + types the entry table the shell supports.
 */
export const DEEP_LINK_SCHEME = 'panchangpal';

export interface DeepLinkRoute {
  pattern: string; // panchangpal://…
  route: string; // expo-router path
}

export const DEEP_LINKS: DeepLinkRoute[] = [
  { pattern: 'panchangpal://today', route: '/(tabs)/today' },
  { pattern: 'panchangpal://calendar', route: '/(tabs)/calendar' },
  { pattern: 'panchangpal://ask', route: '/(tabs)/guru' },
  { pattern: 'panchangpal://you', route: '/(tabs)/you' },
  { pattern: 'panchangpal://festival/:id', route: '/(tabs)/calendar' },
  { pattern: 'panchangpal://personal-date/:id', route: '/(tabs)/calendar' },
  { pattern: 'panchangpal://invite/:token', route: '/(onboarding)/sign-in' },
  { pattern: 'panchangpal://subscription', route: '/(tabs)/you' },
];
