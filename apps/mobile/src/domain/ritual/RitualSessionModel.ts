import type { RitualDefinition, RitualPlayerViewModel, RitualSession, RitualSessionStatus } from './types';

export function createRitualSession(ritual: RitualDefinition, localDate: string): RitualSession {
  if (ritual.steps.length === 0) throw new Error('ERR_RITUAL_EMPTY');
  return { ritualId: ritual.id, localDate, stepIndex: 0, status: 'intro', skippedStepIndices: [], completionRecorded: false };
}

export function isSessionForRitual(session: RitualSession, ritual: RitualDefinition, localDate: string): boolean {
  return session.ritualId === ritual.id && session.localDate === localDate && session.stepIndex < ritual.steps.length;
}

export function withStatus(session: RitualSession, status: RitualSessionStatus): RitualSession {
  return { ...session, status };
}

export function advanceSession(session: RitualSession, totalSteps: number): RitualSession {
  if (session.status !== 'active') return session;
  if (session.stepIndex >= totalSteps - 1) return { ...session, status: 'completed' };
  return { ...session, stepIndex: session.stepIndex + 1 };
}

export function skipSession(session: RitualSession, totalSteps: number): RitualSession {
  const skipped = session.skippedStepIndices.includes(session.stepIndex)
    ? session.skippedStepIndices
    : [...session.skippedStepIndices, session.stepIndex];
  return advanceSession({ ...session, skippedStepIndices: skipped }, totalSteps);
}

export function toRitualPlayerViewModel(ritual: RitualDefinition, session: RitualSession): RitualPlayerViewModel {
  const step = session.status === 'active' || session.status === 'paused' ? ritual.steps[session.stepIndex] : undefined;
  return {
    state: session.status,
    title: ritual.title,
    intro: ritual.intro,
    depth: ritual.depth,
    step,
    stepNumber: step ? session.stepIndex + 1 : undefined,
    totalSteps: ritual.steps.length,
    canAdvance: session.status === 'active',
    canSkip: session.status === 'active' && ritual.steps.length > 1,
    audioAvailable: Boolean(step?.audioKey),
    completionRecorded: session.completionRecorded,
  };
}
