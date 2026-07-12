import { describe, it, expect } from 'vitest';
import {
  resolveRitualCompletion,
  resolveChecklist,
  resolvePersonalDate,
  reconcileStreak,
  type Mutation,
} from './logic';

const mut = (over: Partial<Mutation> = {}): Mutation => ({
  kind: 'ritual_complete',
  payload: {},
  client_id: 'c1',
  local_ts: '2026-07-12T06:00:00Z',
  ...over,
});

describe('SVC_sync conflict rules (TDD Part 2 §6.6)', () => {
  it('ritual completion is client-authoritative & idempotent per day', () => {
    expect(resolveRitualCompletion(mut(), false).resolution).toBe('applied');
    expect(resolveRitualCompletion(mut(), true).resolution).toBe('deduped');
  });

  it('checklist unions (dedupes an existing tick)', () => {
    expect(resolveChecklist(mut({ kind: 'checklist' }), false).resolution).toBe('applied');
    expect(resolveChecklist(mut({ kind: 'checklist' }), true).resolution).toBe('deduped');
  });

  it('personal_date last-writer-wins on updated_at', () => {
    // incoming older than existing → superseded
    expect(
      resolvePersonalDate(mut({ kind: 'personal_date' }), '2026-07-12T09:00:00Z').resolution,
    ).toBe('superseded');
    // incoming newer than existing → applied
    expect(
      resolvePersonalDate(
        mut({ kind: 'personal_date', local_ts: '2026-07-12T10:00:00Z' }),
        '2026-07-12T09:00:00Z',
      ).resolution,
    ).toBe('applied');
    // no existing → applied
    expect(resolvePersonalDate(mut({ kind: 'personal_date' }), null).resolution).toBe('applied');
  });

  it('personal_date delete tombstones', () => {
    expect(
      resolvePersonalDate(mut({ kind: 'personal_date', payload: { deleted_at: 'x' } }), null)
        .resolution,
    ).toBe('tombstoned');
  });

  it('streak reconciliation keeps the longer streak', () => {
    expect(reconcileStreak(5, 9)).toBe(9);
    expect(reconcileStreak(12, 3)).toBe(12);
  });
});
