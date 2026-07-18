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
  // M7: invite lands on the household invite-accept screen (SCR_HOUSEHOLD_INVITE_001). For an
  // authenticated user the token is applied directly; anonymous users hit the deferred-auth
  // prompt on that screen (UX-2). Deferred (post-install) invites are captured at first launch.
  { pattern: 'panchangpal://invite/:token', route: '/(tabs)/you/invite' },
  // M8: SCR_SUBSCRIPTION_001, back-stack You → Subscription (TDD §3.3 deep-link table).
  { pattern: 'panchangpal://subscription', route: '/(tabs)/you/subscription' },
];
