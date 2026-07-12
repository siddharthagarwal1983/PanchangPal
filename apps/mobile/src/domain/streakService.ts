/**
 * StreakService (TDD Part 4 §1.3 domain) — pure VIEW logic for the streak (never sets the
 * streak; the server derives it). Grace-aware, supportive framing (UX-3) — NO loss-framing.
 * Vitest/jest-testable.
 */
import type { StreakState } from '@panchangpal/shared';

export interface StreakView {
  days: number;
  graceUsed: boolean;
  /** i18n key + count for "{n} day streak". */
  labelCount: number;
  showGraceCopy: boolean;
}

export function toStreakView(streak: StreakState | null | undefined): StreakView {
  const days = streak?.current_len ?? 0;
  const graceUsed = Boolean(streak?.grace_used);
  return { days, graceUsed, labelCount: days, showGraceCopy: graceUsed };
}
