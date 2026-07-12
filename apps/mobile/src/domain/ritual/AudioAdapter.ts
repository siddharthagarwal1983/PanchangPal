/**
 * Audio adapter abstraction (TDD Part 4 §8).
 * Keeps the ritual domain independent of Expo AV / native audio APIs.
 * A concrete implementation will be provided by the data layer.
 */

export interface AudioAdapter {
  /**
   * Play an audio resource identified by its key.
   */
  play(_audioKey: string): Promise<void>;

  /**
   * Stop any currently playing audio.
   */
  stop(): Promise<void>;

  /**
   * Returns whether an audio resource is available locally.
   */
  isAvailable(_audioKey: string): Promise<boolean>;
}

/**
 * Default no-op implementation used during development and tests.
 */
export class NoopAudioAdapter implements AudioAdapter {
  async play(_audioKey: string): Promise<void> {
    // Intentionally empty.
  }

  async stop(): Promise<void> {
    // Intentionally empty.
  }

  async isAvailable(_audioKey: string): Promise<boolean> {
    return false;
  }
}