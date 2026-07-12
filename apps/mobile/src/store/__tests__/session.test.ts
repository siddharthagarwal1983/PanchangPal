/**
 * STORE_session tests — auth flow + session restore (TDD Part 4 §4.2; ADR-009). Mocks the
 * AuthRepository so no network is needed. Asserts: bootstrap restores an existing session;
 * bootstrap creates an anon session when none exists; upgradeAndMerge merges anon→auth (F-1);
 * signOut returns to an anonymous session.
 */
import { useSessionStore } from '../session';

const restore = jest.fn();
const signInAnonymously = jest.fn();
const merge = jest.fn();
const signOut = jest.fn();

jest.mock('../../data/authRepository', () => ({
  authRepository: {
    restore: (...a: unknown[]) => restore(...a),
    signInAnonymously: (...a: unknown[]) => signInAnonymously(...a),
    merge: (...a: unknown[]) => merge(...a),
    signOut: (...a: unknown[]) => signOut(...a),
  },
}));

const reset = () =>
  useSessionStore.setState({ userId: null, isAnonymous: true, jwt: null, status: 'loading' });

beforeEach(() => {
  jest.clearAllMocks();
  reset();
});

describe('session bootstrap (restore or anonymous)', () => {
  it('restores an existing anonymous session', async () => {
    restore.mockResolvedValue({ userId: 'anon-1', isAnonymous: true, jwt: 'jwt' });
    await useSessionStore.getState().bootstrap();
    expect(signInAnonymously).not.toHaveBeenCalled();
    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(useSessionStore.getState().userId).toBe('anon-1');
  });

  it('creates an anonymous session when none exists (ADR-009)', async () => {
    restore.mockResolvedValue(null);
    signInAnonymously.mockResolvedValue({ userId: 'anon-2', isAnonymous: true, jwt: 'jwt' });
    await useSessionStore.getState().bootstrap();
    expect(signInAnonymously).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('sets error status if bootstrap fails', async () => {
    restore.mockRejectedValue(new Error('network'));
    await useSessionStore.getState().bootstrap();
    expect(useSessionStore.getState().status).toBe('error');
  });
});

describe('upgradeAndMerge (F-1)', () => {
  it('merges when upgrading from a different anon uid, then becomes authenticated', async () => {
    merge.mockResolvedValue(undefined);
    await useSessionStore
      .getState()
      .upgradeAndMerge({ userId: 'auth-1', isAnonymous: false, jwt: 'jwt2' }, 'anon-9');
    expect(merge).toHaveBeenCalledWith('anon-9');
    expect(useSessionStore.getState().status).toBe('authenticated');
    expect(useSessionStore.getState().isAnonymous).toBe(false);
  });

  it('does not merge when there is no previous anon uid', async () => {
    await useSessionStore
      .getState()
      .upgradeAndMerge({ userId: 'auth-2', isAnonymous: false, jwt: 'jwt3' }, null);
    expect(merge).not.toHaveBeenCalled();
  });
});

describe('signOut returns to anonymous (deferred auth)', () => {
  it('signs out then re-anon so the offline loop keeps working', async () => {
    signOut.mockResolvedValue(undefined);
    signInAnonymously.mockResolvedValue({ userId: 'anon-3', isAnonymous: true, jwt: 'jwt' });
    await useSessionStore.getState().signOut();
    expect(signOut).toHaveBeenCalled();
    expect(useSessionStore.getState().status).toBe('anonymous');
  });
});
