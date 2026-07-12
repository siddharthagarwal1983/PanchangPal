/**
 * RitualProgressService (TDD Part 4 §1.3 domain) — pure logic mapping ritual/resume data to
 * the RitualCard state (not_started | in_progress | completed) and the action-label key.
 * Uses STORE_ui's ritual-resume pointer (persisted so an app-kill resumes today's ritual,
 * PDD AC-RIT-03). Jest-testable.
 */
import type { RitualState } from '@panchangpal/ui';

export interface RitualProgressInput {
  completedToday: boolean;
  resumeStep: number | null; // from STORE_ui ritual-resume pointer for today's ritual
}

export interface RitualProgressView {
  state: RitualState;
  /** i18n action-label key; for in_progress, `step` supplies the "Continue at step N" count. */
  actionKey: 'ritual.begin' | 'ritual.continue' | 'ritual.done';
  step?: number;
}

export function toRitualProgress({ completedToday, resumeStep }: RitualProgressInput): RitualProgressView {
  if (completedToday) return { state: 'completed', actionKey: 'ritual.done' };
  if (resumeStep && resumeStep > 0) return { state: 'in_progress', actionKey: 'ritual.continue', step: resumeStep };
  return { state: 'not_started', actionKey: 'ritual.begin' };
}
