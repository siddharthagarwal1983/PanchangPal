import { NullAudioAdapter, RitualEngine, type AudioAdapter, type RitualDefinition, type RitualSession, type RitualSessionStore } from '../ritual';

const ritual: RitualDefinition = { id: 'ritual-1', title: 'Daily practice', depth: 'quick', intro: 'A calm moment', steps: [{ text: 'First' }, { text: 'Second', audioKey: 'second.mp3' }] };

class MemoryStore implements RitualSessionStore {
  session: RitualSession | null = null;
  async load(): Promise<RitualSession | null> { return this.session; }
  async save(session: RitualSession): Promise<void> { this.session = session; }
  async clear(): Promise<void> { this.session = null; }
}

class AvailableAudio implements AudioAdapter {
  played: string[] = [];
  async play(key: string): Promise<void> { this.played.push(key); }
  async pause(): Promise<void> {}
  async stop(): Promise<void> {}
  async isAvailable(): Promise<boolean> { return true; }
}

describe('RitualEngine', () => {
  it('navigates, skips, pauses and restores a session through its store', async () => {
    const store = new MemoryStore();
    const engine = await RitualEngine.restore(ritual, '2026-07-12', store);
    expect(engine.view().state).toBe('intro');
    await engine.begin();
    await engine.skip();
    expect(engine.view()).toMatchObject({ state: 'active', stepNumber: 2 });
    expect(store.session?.skippedStepIndices).toEqual([0]);
    await engine.pause();
    expect(engine.view().state).toBe('paused');
    const restored = await RitualEngine.restore(ritual, '2026-07-12', store);
    expect(restored.view()).toMatchObject({ state: 'paused', stepNumber: 2 });
  });

  it('enters a dedicated completion state and records completion separately', async () => {
    const engine = await RitualEngine.restore(ritual, '2026-07-12', new MemoryStore());
    await engine.begin();
    await engine.next();
    await engine.next();
    expect(engine.view()).toMatchObject({ state: 'completed', completionRecorded: false });
    await engine.markCompletionRecorded();
    expect(engine.view().completionRecorded).toBe(true);
  });

  it('uses the null adapter safely and exposes text-only audio fallback', async () => {
    const engine = await RitualEngine.restore(ritual, '2026-07-12', new MemoryStore(), new NullAudioAdapter());
    await engine.begin();
    await engine.next();
    expect(engine.view().audioAvailable).toBe(false);
    await engine.toggleAudio();
  });

  it('delegates available audio playback through the injected adapter', async () => {
    const audio = new AvailableAudio();
    const engine = await RitualEngine.restore(ritual, '2026-07-12', new MemoryStore(), audio);
    await engine.begin();
    await engine.next();
    await engine.toggleAudio();
    expect(audio.played).toEqual(['second.mp3']);
  });
});
