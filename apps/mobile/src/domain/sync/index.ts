/**
 * Offline sync domain barrel (TDD Part 4 §6). Pure queue shape + drain rules; nothing here imports
 * the data layer, a store, or a vendor SDK (dependency direction, TDD Part 1 §5).
 */
export {
  SYNCABLE_KINDS,
  type MutationKind,
  type QueuedMutation,
  type SyncResponse,
} from './types';
export {
  applyPendingCompletions,
  pendingChecklistDates,
  pendingChecklistItemIds,
} from './pendingProjection';
export {
  MAX_SYNC_ATTEMPTS,
  SYNC_BATCH_LIMIT,
  backoffDelayMs,
  isDue,
  isExhausted,
  nextBatch,
  reconcileBatch,
  withFailedAttempt,
  type BatchReconciliation,
} from './syncPlan';
