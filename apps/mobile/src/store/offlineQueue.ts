/**
 * STORE_offlineQueue (TDD Part 4 §4.2/§6). Durable list of pending mutations,
 * MMKV-persisted so it survives app kill; drains via API_POST_SYNC (SVC_sync).
 * Idempotency via client_id (§6.3). MMKV persistence + drain orchestration are
 * implemented in the offline-queue task; this defines the queue shape + enqueue seam.
 */
import { create } from 'zustand';

export interface QueuedMutation {
  id: string;
  kind: 'ritual_complete' | 'checklist' | 'personal_date';
  payload: unknown;
  client_id: string;
  local_ts: string; // ISO-8601
  attempts: number;
}

interface OfflineQueueState {
  queue: QueuedMutation[];
  enqueue: (m: QueuedMutation) => void;
  dequeue: (id: string) => void;
  clear: () => void;
}

export const useOfflineQueueStore = create<OfflineQueueState>((set) => ({
  queue: [],
  enqueue: (m) => set((s) => ({ queue: [...s.queue, m] })),
  dequeue: (id) => set((s) => ({ queue: s.queue.filter((m) => m.id !== id) })),
  clear: () => set({ queue: [] }),
}));
