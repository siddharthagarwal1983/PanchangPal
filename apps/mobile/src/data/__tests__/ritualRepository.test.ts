/**
 * RitualRepository tests (API_GET_RITUAL). Mocks supabase-js so no network is needed.
 *
 * The contract under test is absence vs failure. This repository used to throw
 * ERR_RITUAL_EMPTY when no ritual row existed, so the ordinary state of having no content
 * yet reached SCR_RITUAL_001 as a failed query — the screen showed "Something went wrong"
 * and its empty state was unreachable. Only a real query failure may throw.
 */
import { RitualRepository, toRitualDefinition } from '../ritualRepository';

type Result = { data: unknown; error: unknown };

function makeDb(result: Result, capture?: (op: string, ...args: unknown[]) => void) {
  const builder: Record<string, unknown> = {};
  // Captures ALL arguments: `eq(column, value)` takes two, and the value is the point.
  const chain = (op: string) => (...args: unknown[]) => {
    capture?.(op, ...args);
    return builder;
  };
  builder.select = chain('select');
  builder.eq = chain('eq');
  builder.limit = chain('limit');
  builder.maybeSingle = () => Promise.resolve(result);
  return { from: (table: string) => (capture?.('from', table), builder) } as never;
}

const ROW = {
  id: 'r-1',
  title: 'Daily Practice',
  intro: 'A calm daily observance.',
  steps: [{ text: 'Light a lamp', audio_key: null, duration: 60 }],
  depth: 'quick',
};

describe('RitualRepository.getToday', () => {
  it('maps a published ritual', async () => {
    const ritual = await new RitualRepository(makeDb({ data: ROW, error: null })).getToday('generic', 'quick');
    expect(ritual).toMatchObject({ id: 'r-1', title: 'Daily Practice', depth: 'quick' });
    expect(ritual?.steps).toHaveLength(1);
  });

  it('returns null — not an error — when no ritual is published', async () => {
    // Regression: this threw ERR_RITUAL_EMPTY, so an empty content table surfaced as a
    // failed query. Exactly staging's state, and any new tradition/depth combination.
    await expect(new RitualRepository(makeDb({ data: null, error: null })).getToday('generic', 'quick')).resolves.toBeNull();
  });

  it('returns null when the row carries no usable steps', async () => {
    const db = makeDb({ data: { ...ROW, steps: [] }, error: null });
    await expect(new RitualRepository(db).getToday('generic', 'quick')).resolves.toBeNull();
  });

  it('still throws on a genuine query failure', async () => {
    const db = makeDb({ data: null, error: { message: 'boom' } });
    await expect(new RitualRepository(db).getToday('generic', 'quick')).rejects.toThrow('ERR_RITUAL_UNAVAILABLE');
  });

  it('scopes the query to the requested tradition and depth', async () => {
    const calls: unknown[][] = [];
    const db = makeDb({ data: ROW, error: null }, (op, ...args) => calls.push([op, ...args]));
    await new RitualRepository(db).getToday('bengali', 'deep');
    expect(calls).toContainEqual(['from', 'ritual']);
    expect(calls).toContainEqual(['eq', 'tradition_code', 'bengali']);
    expect(calls).toContainEqual(['eq', 'depth', 'deep']);
  });
});

describe('toRitualDefinition', () => {
  it('drops malformed steps and keeps the usable ones', () => {
    const ritual = toRitualDefinition({
      ...ROW,
      steps: [{ text: 'Valid' }, { text: '   ' }, { notText: 1 }, null],
    } as never);
    expect(ritual?.steps.map((s) => s.text)).toEqual(['Valid']);
  });

  it('returns null when steps are not an array', () => {
    expect(toRitualDefinition({ ...ROW, steps: 'nonsense' } as never)).toBeNull();
  });
});
