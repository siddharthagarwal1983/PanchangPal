import { LocalGuruHistoryRepository, type HistoryStorage } from '../guru/history';

class MemStorage implements HistoryStorage {
  #m = new Map<string, string>();
  getString(k: string) { return this.#m.get(k); }
  set(k: string, v: string) { this.#m.set(k, v); }
}

const entry = (id: string, over: Partial<{ question: string; outcome: 'grounded' | 'declined' | 'refused' | 'error' }> = {}) => ({
  id,
  question: over.question ?? `Q${id}`,
  outcome: over.outcome ?? ('declined' as const),
  createdAt: new Date(Number(id) * 1000).toISOString(),
});

describe('LocalGuruHistoryRepository (owner-only local cache)', () => {
  it('starts empty and records newest-first', () => {
    const repo = new LocalGuruHistoryRepository(new MemStorage());
    expect(repo.list()).toEqual([]);
    repo.record(entry('1'));
    repo.record(entry('2', { outcome: 'grounded' }));
    expect(repo.list().map((e) => e.id)).toEqual(['2', '1']);
    expect(repo.list()[0].outcome).toBe('grounded');
  });

  it('dedupes by id and clears', () => {
    const repo = new LocalGuruHistoryRepository(new MemStorage());
    repo.record(entry('1', { question: 'first' }));
    repo.record(entry('1', { question: 'updated' }));
    expect(repo.list()).toHaveLength(1);
    expect(repo.list()[0].question).toBe('updated');
    repo.clear();
    expect(repo.list()).toEqual([]);
  });

  it('records only questions + server outcomes, never a fabricated answer', () => {
    const repo = new LocalGuruHistoryRepository(new MemStorage());
    repo.record(entry('1', { outcome: 'refused' }));
    const row = repo.list()[0];
    expect(Object.keys(row).sort()).toEqual(['createdAt', 'id', 'outcome', 'question']);
  });
});
