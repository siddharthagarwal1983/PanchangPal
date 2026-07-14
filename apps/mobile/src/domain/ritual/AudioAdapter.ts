/**
 * Audio abstraction for ritual playback.
 * Keeps the RitualEngine independent of Expo AV or any concrete player.
 */

export interface AudioAdapter {
  play(audioKey: string): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;

  /**
   * Returns true if the requested audio asset is available for playback.
   */
  isAvailable(audioKey: string): Promise<boolean>;
}

/**
 * Default no-op implementation used until a real audio backend
 * (Expo AV / react-native-track-player) is wired in.
 */
export class NullAudioAdapter implements AudioAdapter {
  async play(_audioKey: string): Promise<void> {
    // no-op
  }

  async pause(): Promise<void> {
    // no-op
  }

  async resume(): Promise<void> {
    // no-op
  }

  async stop(): Promise<void> {
    // no-op
  }

  async isAvailable(_audioKey: string): Promise<boolean> {
    return false;
  }
}