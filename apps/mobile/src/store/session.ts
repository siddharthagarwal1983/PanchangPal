/**
 * STORE_session (TDD Part 4 §4.2). Session/identity: anon/auth, JWT, status.
 * Subscribes to supabase `onAuthStateChange` and exposes signInAnon / upgradeAndMerge
 * (calls API_POST_AUTH_MERGE) / signOut. Behavior is wired in the auth task; this is
 * the store shape + seam. Server data is NEVER stored here (§4.1).
 */
import { create } from 'zustand';

export type SessionStatus = 'loading' | 'anonymous' | 'authenticated' | 'signed_out';

interface SessionState {
  userId: string | null;
  isAnonymous: boolean;
  jwt: string | null;
  status: SessionStatus;
  setSession: (s: Partial<Omit<SessionState, 'setSession'>>) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  isAnonymous: true,
  jwt: null,
  status: 'loading',
  setSession: (s) => set(s),
}));
