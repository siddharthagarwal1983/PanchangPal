/** Domain vocabulary for the reusable guided ritual player (SCR_RITUAL_001). */
export interface RitualStep {
  text: string;
  audioKey?: string;
  durationSeconds?: number;
}

export interface RitualDefinition {
  id: string;
  title: string;
  intro?: string;
  depth: 'quick' | 'deep';
  steps: readonly RitualStep[];
}

export type RitualSessionStatus = 'intro' | 'active' | 'paused' | 'completed';

export interface RitualSession {
  ritualId: string;
  localDate: string;
  stepIndex: number;
  status: RitualSessionStatus;
  skippedStepIndices: readonly number[];
  completionRecorded: boolean;
}

export interface RitualPlayerViewModel {
  state: RitualSessionStatus;
  title: string;
  intro?: string;
  depth: 'quick' | 'deep';
  step?: RitualStep;
  stepNumber?: number;
  totalSteps: number;
  canAdvance: boolean;
  canSkip: boolean;
  audioAvailable: boolean;
  completionRecorded: boolean;
}
