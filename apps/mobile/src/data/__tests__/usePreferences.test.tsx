/**
 * `useUpdatePreferences` durability (§6.3).
 *
 * The defect these pin: the hook wrote straight to the server with an optimistic update and
 * nothing behind it, so an app kill inside the request window silently reverted the setting — and
 * because `FLOW_AUTH_SESSION_PERSISTENCE` reads the tradition back as its proof of identity, that
 * loss presented as IDENTITY LOSS and was misattributed three times.
 */
import { type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdatePreferences } from '../hooks/usePreferences';
import { getProfileRepository } from '../profileRepository';
import { useSessionStore } from '../../store/session';
import {
  resetOfflineQueueForTests,
  setOfflineQueueStorageForTests,
  useOfflineQueueStore,
} from '../../store/offlineQueue';
import type { KeyValueStore } from '../keyValueStore';

const USER = 'user-1';

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
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useUpdatePreferences(), { wrapper });
  return { qc, result };
}

beforeEach(() => {
  setOfflineQueueStorageForTests(memoryStore());
  resetOfflineQueueForTests();
  useSessionStore.setState({ userId: USER });
  jest.restoreAllMocks();
});

afterEach(() => {
  for (const qc of clients.splice(0)) qc.clear();
  setOfflineQueueStorageForTests(null);
});

describe('useUpdatePreferences durability', () => {
  it('queues the change durably before attempting the direct write', async () => {
    jest
      .spyOn(getProfileRepository(), 'updatePreferences')
      .mockRejectedValue(new Error('Network request failed'));

    const { result } = setup();
    result.current.mutate({ tradition: 'bengali' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const queue = useOfflineQueueStore.getState().queue;
    expect(queue).toHaveLength(1);
    expect(queue[0].kind).toBe('preferences');
    // The ROW form, not the domain patch — the server upserts columns behind an allowlist.
    expect(queue[0].payload).toEqual({ tradition_code: 'bengali' });
    // Stamped with the identity that made it, so the drain cannot apply it under another uid.
    expect(queue[0].user_id).toBe(USER);
  });

  it('does not revert the optimistic value while the change is still queued', async () => {
    // Offline this is the normal path: the direct write always fails and the queue will deliver
    // it. Remove the guard in usePreferences.ts and this fails.
    jest
      .spyOn(getProfileRepository(), 'updatePreferences')
      .mockRejectedValue(new Error('Network request failed'));

    const { qc, result } = setup();
    qc.setQueryData(['preferences', USER], {
      tradition: 'generic',
      depth: 'quick',
      appearance: 'system',
      ritualTime: null,
      timezone: null,
      city: null,
    });

    result.current.mutate({ tradition: 'bengali' });
    await waitFor(() => expect(result.current.isError).toBe(true));

    const cached = qc.getQueryData<{ tradition: string }>(['preferences', USER]);
    expect(cached?.tradition).toBe('bengali');
  });

  it('reverts when nothing is left in the queue to deliver it', async () => {
    jest.spyOn(getProfileRepository(), 'updatePreferences').mockImplementation(async () => {
      // Stand in for the drain retiring the entry before the direct write settles.
      useOfflineQueueStore.getState().clear();
      throw new Error('rejected');
    });

    const { qc, result } = setup();
    qc.setQueryData(['preferences', USER], {
      tradition: 'generic',
      depth: 'quick',
      appearance: 'system',
      ritualTime: null,
      timezone: null,
      city: null,
    });

    result.current.mutate({ tradition: 'bengali' });
    await waitFor(() => expect(result.current.isError).toBe(true));

    const cached = qc.getQueryData<{ tradition: string }>(['preferences', USER]);
    expect(cached?.tradition).toBe('generic');
  });
});
