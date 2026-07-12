import { NullAudioAdapter, type AudioAdapter } from './AudioAdapter';
import { advanceSession, createRitualSession, isSessionForRitual, skipSession, toRitualPlayerViewModel, withStatus } from './RitualSessionModel';
import type { RitualDefinition, RitualPlayerViewModel, RitualSession } from './types';

export interface RitualSessionStore {
  load(ritualId: string, localDate: string): Promise<RitualSession | null>;
  save(session: RitualSession): Promise<void>;
  clear(ritualId: string, localDate: string): Promise<void>;
}

/** Reusable application service: owns ritual navigation, pause/resume, skip and completion state. */
export class RitualEngine {
  private session: RitualSession;
  private audioAvailable = false;

  private constructor(
    private readonly ritual: RitualDefinition,
    private readonly store: RitualSessionStore,
    private readonly audio: AudioAdapter,
    session: RitualSession,
  ) {
    this.session = session;
  }

  static async restore(ritual: RitualDefinition, localDate: string, store: RitualSessionStore, audio: AudioAdapter = new NullAudioAdapter()): Promise<RitualEngine> {
    const saved = await store.load(ritual.id, localDate);
    const engine = new RitualEngine(ritual, store, audio, saved && isSessionForRitual(saved, ritual, localDate) ? saved : createRitualSession(ritual, localDate));
    await engine.refreshAudioAvailability();
    return engine;
  }

  view(): RitualPlayerViewModel { return { ...toRitualPlayerViewModel(this.ritual, this.session), audioAvailable: this.audioAvailable }; }
  snapshot(): RitualSession { return this.session; }

  async begin(): Promise<void> { await this.commit(withStatus(this.session, 'active')); await this.refreshAudioAvailability(); }
  async pause(): Promise<void> { await this.audio.pause(); await this.commit(withStatus(this.session, 'paused')); }
  async resume(): Promise<void> { await this.commit(withStatus(this.session, 'active')); await this.refreshAudioAvailability(); }
  async leave(): Promise<void> { await this.audio.stop(); await this.store.save(this.session); }
  async next(): Promise<void> { await this.commit(advanceSession(this.session, this.ritual.steps.length)); await this.refreshAudioAvailability(); }
  async skip(): Promise<void> { await this.commit(skipSession(this.session, this.ritual.steps.length)); await this.refreshAudioAvailability(); }

  async toggleAudio(): Promise<void> {
    const key = this.ritual.steps[this.session.stepIndex]?.audioKey;
    if (this.session.status !== 'active' || !key || !(await this.audio.isAvailable(key))) return;
    await this.audio.play(key);
  }

  async markCompletionRecorded(): Promise<void> { await this.commit({ ...this.session, completionRecorded: true }); }

  private async commit(session: RitualSession): Promise<void> { this.session = session; await this.store.save(session); }
  private async refreshAudioAvailability(): Promise<void> {
    const key = this.ritual.steps[this.session.stepIndex]?.audioKey;
    this.audioAvailable = Boolean(key && this.session.status === 'active' && await this.audio.isAvailable(key));
  }
}
