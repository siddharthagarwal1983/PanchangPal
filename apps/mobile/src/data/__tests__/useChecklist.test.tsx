/**
 * `useToggleChecklistItem`'s revert rule (TDD Part 4 §6).
 *
 * The behaviour under test is the offline one: the direct write to `todayRepository` ALWAYS fails
 * with no network, and the completion is nonetheless durably queued. Reverting there tells the
 * user their completion was lost while it sits safely on disk — the tick blinking out seconds
 * after they tapped it. A genuine rejection with nothing left in the queue must still revert, or
 * the screen would show a completion no path will ever deliver.
 */
import { type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToggleChecklistItem } from '../hooks/useChecklist';
import { todayRepository } from '../todayRepository';
import {
  resetOfflineQueueForTests,
  setOfflineQueueStorageForTests,
  useOfflineQueueStore,
} from '../../store/offlineQueue';
import type { KeyValueStore } from '../keyValueStore';

const LOCAL_DATE = '2026-07-28';
const KEY = ['checklist', LOCAL_DATE];
const ITEMS = [
  { id: 'item-1', label: 'Light the lamp', complete: false },
  { id: 'item-2', label: 'Offer water', complete: false },
];

function memoryStore(): KeyValueStore {
  const values = new Map<string, string>();
  return {
    getString: (k) => values.get(k),
    set: (k, v) => void values.set(k, v),
    delete: (k) => void values.delete(k),
  };
}

const clients: QueryClient[] = [];

function setup() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  clients.push(qc);
  qc.setQueryData(KEY, ITEMS);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useToggleChecklistItem(LOCAL_DATE), { wrapper });
  return { qc, result };
}

function completeOf(qc: QueryClient, id: string): boolean | undefined {
  return qc.getQueryData<typeof ITEMS>(KEY)?.find((i) => i.id === id)?.complete;
}

beforeEach(() => {
  setOfflineQueueStorageForTests(memoryStore());
  resetOfflineQueueForTests();
  jest.restoreAllMocks();
});

afterEach(() => {
  for (const qc of clients.splice(0)) qc.clear();
  setOfflineQueueStorageForTests(null);
});

describe('useToggleChecklistItem offline', () => {
  it('keeps the tick when the write fails but the completion is still queued', async () => {
    // The offline case. Revert this guard in `useChecklist.ts` and this test fails.
    jest
      .spyOn(todayRepository, 'toggleChecklist')
      .mockRejectedValue(new Error('Network request failed'));

    const { qc, result } = setup();
    result.current.mutate('item-1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(completeOf(qc, 'item-1')).toBe(true);
    // And the mutation really is queued, so the tick is backed by a delivery path rather than
    // being wishful: a tick with an empty queue would be the worse of the two failures.
    expect(useOfflineQueueStore.getState().queue).toHaveLength(1);
  });

  it('reverts when nothing is left in the queue to deliver it', async () => {
    jest.spyOn(todayRepository, 'toggleChecklist').mockImplementation(async () => {
      // Stand in for the drain retiring the entry before the direct write settles: the completion
      // now has no pending delivery, so the optimistic tick has nothing backing it.
      useOfflineQueueStore.getState().clear();
      throw new Error('rejected');
    });

    const { qc, result } = setup();
    result.current.mutate('item-1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(completeOf(qc, 'item-1')).toBe(false);
  });

  it('leaves other items alone either way', async () => {
    jest
      .spyOn(todayRepository, 'toggleChecklist')
      .mockRejectedValue(new Error('Network request failed'));

    const { qc, result } = setup();
    result.current.mutate('item-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(completeOf(qc, 'item-2')).toBe(false);
  });
});
