/**
 * STORE_session (TDD Part 4 §4.2) — session/identity: anon/auth, JWT, status. Delegates
 * ALL auth work to AuthRepository (never supabase-js directly). Realizes deferred +
 * anonymous-first auth (UX-2 / ADR-009): bootstrap restores or creates an anon session;
 * upgradeAndMerge upgrades to a real account and merges (F-1); signOut ends the session.
 * Server data is NEVER stored here (§4.1).
 */
import { create } from 'zustand';
import { authRepository, type AuthSession } from '../data/authRepository';

export type SessionStatus = 'loading' | 'anonymous' | 'authenticated' | 'signed_out' | 'error';

interface SessionState {
  userId: string | null;
  isAnonymous: boolean;
  jwt: string | null;
  status: SessionStatus;
  /** Restore an existing session or create an anonymous one (bootstrap). */
  bootstrap: () => Promise<void>;
  /** Upgrade the anon session to a provider/OTP session and merge anon data (F-1). */
  upgradeAndMerge: (next: AuthSession, previousAnonUid: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  apply: (s: AuthSession | null) => void;
}

function statusFor(s: AuthSession | null): SessionStatus {
  if (!s) return 'signed_out';
  return s.isAnonymous ? 'anonymous' : 'authenticated';
}

export const useSessionStore = create<SessionState>((set, get) => ({
  userId: null,
  isAnonymous: true,
  jwt: null,
  status: 'loading',

  apply: (s) =>
    set({ userId: s?.userId ?? null, isAnonymous: s?.isAnonymous ?? true, jwt: s?.jwt ?? null, status: statusFor(s) }),

  bootstrap: async () => {
    try {
      const existing = await authRepository.restore();
      const session = existing ?? (await authRepository.signInAnonymously());
      get().apply(session);
    } catch {
      set({ status: 'error' });
    }
  },

  upgradeAndMerge: async (next, previousAnonUid) => {
    if (previousAnonUid && previousAnonUid !== next.userId) {
      await authRepository.merge(previousAnonUid); // F-1 (EVT_045)
    }
    get().apply(next);
  },

  signOut: async () => {
    await authRepository.signOut();
    // Return to an anonymous session so the offline loop keeps working (deferred auth).
    const anon = await authRepository.signInAnonymously();
    get().apply(anon);
  },
}));
