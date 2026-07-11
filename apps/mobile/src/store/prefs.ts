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
  setPrefs: (p: Partial<Omit<PrefsState, 'setPrefs'>>) => void;
}

export const usePrefsStore = create<PrefsState>((set) => ({
  tradition: 'generic',
  depth: 'quick',
  appearance: 'system',
  setPrefs: (p) => set(p),
}));
