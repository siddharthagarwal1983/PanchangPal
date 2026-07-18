/**
 * AuthRepository — the ONLY gateway to authentication (TDD Part 4 §5.1). Wraps supabase-js
 * + the approved API_* contracts (TDD Part 2 §5.1). Realizes anonymous-first identity
 * (ADR-009): a real anon session exists from first launch; provider sign-in (Apple / Google
 * / email-OTP) upgrades it, and SVC_account merges anon-owned data (F-1). No fake auth;
 * features/stores go through this repository, never supabase-js directly.
 */
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'expo-crypto';
import { getSupabase } from './supabaseClient';

export interface AuthSession {
  userId: string;
  isAnonymous: boolean;
  jwt: string;
}

function toAuthSession(session: Session | null): AuthSession | null {
  if (!session?.user) return null;
  return {
    userId: session.user.id,
    isAnonymous: Boolean((session.user as { is_anonymous?: boolean }).is_anonymous ?? session.user.app_metadata?.provider === 'anonymous'),
    jwt: session.access_token,
  };
}

export class AuthRepository {
  private _db?: SupabaseClient;
  // Lazy client (matches getSubscriptionRepository/getPaymentAdapter): the module-level singleton
  // below is constructed at import, so eagerly calling getSupabase() here would force client
  // creation (and URL validation) on any import of the session store — breaking tests that never
  // exercise auth. Resolve the client on first actual use instead.
  constructor(db?: SupabaseClient) {
    this._db = db;
  }

  private get db(): SupabaseClient {
    return (this._db ??= getSupabase());
  }

  /** Restore an existing session (API_GET_SESSION_VALIDATE, FLOW A2). */
  async restore(): Promise<AuthSession | null> {
    const { data } = await this.db.auth.getSession();
    return toAuthSession(data.session);
  }

  /** Anonymous-auth-first (ADR-009): create an anon session at first launch. */
  async signInAnonymously(): Promise<AuthSession> {
    const { data, error } = await this.db.auth.signInAnonymously();
    if (error || !data.session) throw new Error(error?.message ?? 'anon_signin_failed');
    return toAuthSession(data.session)!;
  }

  /** Provider OAuth — API_POST_AUTH_APPLE / API_POST_AUTH_GOOGLE. */
  async signInWithProvider(provider: 'apple' | 'google', idToken: string, nonce?: string): Promise<AuthSession> {
    const { data, error } = await this.db.auth.signInWithIdToken({ provider, token: idToken, nonce });
    if (error || !data.session) throw new Error(error?.message ?? 'oauth_failed');
    return toAuthSession(data.session)!;
  }

  /** Email OTP start — API_POST_AUTH_EMAIL_START (magic link / code). */
  async startEmailOtp(email: string): Promise<void> {
    const { error } = await this.db.auth.signInWithOtp({ email });
    if (error) throw new Error(error.message);
  }

  /** Email OTP verify — API_POST_AUTH_EMAIL_VERIFY. */
  async verifyEmailOtp(email: string, token: string): Promise<AuthSession> {
    const { data, error } = await this.db.auth.verifyOtp({ email, token, type: 'email' });
    if (error || !data.session) throw new Error(error?.message ?? 'otp_verify_failed');
    return toAuthSession(data.session)!;
  }

  /** anon→auth merge — API_POST_AUTH_MERGE via SVC_account (F-1). */
  async merge(anonUid: string): Promise<void> {
    const { error } = await this.db.functions.invoke('account/merge', {
      body: { anon_uid: anonUid, idempotency_key: randomUUID() },
    });
    if (error) throw new Error(error.message);
  }

  /** Logout — API_POST_AUTH_LOGOUT. */
  async signOut(): Promise<void> {
    const { error } = await this.db.auth.signOut();
    if (error) throw new Error(error.message);
  }

  /** Subscribe to auth changes (silent refresh, expiry). */
  onAuthChange(cb: (s: AuthSession | null) => void): () => void {
    const { data } = this.db.auth.onAuthStateChange((_e, session) => cb(toAuthSession(session)));
    return () => data.subscription.unsubscribe();
  }
}

export const authRepository = new AuthRepository();
