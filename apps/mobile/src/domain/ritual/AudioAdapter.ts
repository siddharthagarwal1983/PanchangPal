/**
 * Audio is an infrastructure concern. The player depends only on this port so text guidance
 * remains fully usable offline and before a production playback adapter is approved.
 */
export interface AudioAdapter {
  play(audioKey: string): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  isAvailable(audioKey: string): Promise<boolean>;
}

export class NullAudioAdapter implements AudioAdapter {
  async play(_audioKey: string): Promise<void> {}
  async pause(): Promise<void> {}
  async stop(): Promise<void> {}
  async isAvailable(_audioKey: string): Promise<boolean> { return false; }
}
