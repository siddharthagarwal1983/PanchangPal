/**
 * STORE_prefs (TDD Part 4 §4.2). Optimistic mirror of user_profile for instant UI
 * (appearance, depth, tradition); server-authoritative and reconciled from Query.
 */
import { create } from 'zustand';
import type { AppearanceMode, ContentDepth, TraditionCode } from '@panchangpal/shared';

interface PrefsState {
  tradition: TraditionCode;
  depth: ContentDepth;
  appearance: AppearanceMode;
  /**
   * IANA zone mirrored from the profile (ADR-026). Null until the profile query resolves or the
   * device zone is adopted — screens must treat null as "not known yet", never as a cue to fall
   * back to UTC or to India time.
   *
   * Mirrored despite not being a display value because date derivation happens during render:
   * a screen cannot await a query to decide which day it is showing. Reading a stale zone for
   * one frame is harmless; computing the wrong day is precisely issue #30.
   */
  timezone: string | null;
  setPrefs: (p: Partial<Omit<PrefsState, 'setPrefs'>>) => void;
}

export const usePrefsStore = create<PrefsState>((set) => ({
  tradition: 'generic',
  depth: 'quick',
  appearance: 'system',
  timezone: null,
  setPrefs: (p) => set(p),
}));
