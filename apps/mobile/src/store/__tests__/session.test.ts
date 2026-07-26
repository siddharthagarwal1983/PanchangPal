/**
 * STORE_session tests — auth flow + session restore (TDD Part 4 §4.2; ADR-009). Mocks the
 * AuthRepository so no network is needed. Asserts: bootstrap restores an existing session;
 * bootstrap creates an anon session when none exists; upgradeAndMerge merges anon→auth (F-1);
 * signOut returns to an anonymous session.
 */
import { useSessionStore } from '../session';

// jest.mock factories may only reference variables prefixed with `mock` (out-of-scope guard).
const mockRestore = jest.fn();
const mockSignInAnonymously = jest.fn();
const mockMerge = jest.fn();
const mockSignOut = jest.fn();

jest.mock('../../data/authRepository', () => ({
  authRepository: {
    restore: (...a: unknown[]) => mockRestore(...a),
    signInAnonymously: (...a: unknown[]) => mockSignInAnonymously(...a),
    merge: (...a: unknown[]) => mockMerge(...a),
    signOut: (...a: unknown[]) => mockSignOut(...a),
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
    mockRestore.mockResolvedValue({ userId: 'anon-1', isAnonymous: true, jwt: 'jwt' });
    await useSessionStore.getState().bootstrap();
    expect(mockSignInAnonymously).not.toHaveBeenCalled();
    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(useSessionStore.getState().userId).toBe('anon-1');
  });

  it('creates an anonymous session when none exists (ADR-009)', async () => {
    mockRestore.mockResolvedValue(null);
    mockSignInAnonymously.mockResolvedValue({ userId: 'anon-2', isAnonymous: true, jwt: 'jwt' });
    await useSessionStore.getState().bootstrap();
    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('sets error status if bootstrap fails', async () => {
    mockRestore.mockRejectedValue(new Error('network'));
    await useSessionStore.getState().bootstrap();
    expect(useSessionStore.getState().status).toBe('error');
  });
});

describe('upgradeAndMerge (F-1)', () => {
  it('merges when upgrading from a different anon uid, then becomes authenticated', async () => {
    mockMerge.mockResolvedValue(undefined);
    await useSessionStore
      .getState()
      .upgradeAndMerge({ userId: 'auth-1', isAnonymous: false, jwt: 'jwt2' }, {
        userId: 'anon-9',
        jwt: 'anon-jwt-9',
      });
    // The TOKEN, not the uid. The server cannot authorize a merge from a uid — it is a claim, not
    // proof of ownership — and passing one was how a victim's rows could be pulled into the
    // caller's account (B6.2). The uid stays client-side, only to skip a no-op merge.
    expect(mockMerge).toHaveBeenCalledWith('anon-jwt-9');
    expect(mockMerge).not.toHaveBeenCalledWith('anon-9');
    expect(useSessionStore.getState().status).toBe('authenticated');
    expect(useSessionStore.getState().isAnonymous).toBe(false);
  });

  it('does not merge when there is no previous anon session', async () => {
    await useSessionStore
      .getState()
      .upgradeAndMerge({ userId: 'auth-2', isAnonymous: false, jwt: 'jwt3' }, null);
    expect(mockMerge).not.toHaveBeenCalled();
  });

  it('does not merge when the anon session has no usable token', async () => {
    // Without a token there is nothing the server can verify, so sending the request would only
    // produce a 422. Skipping is also the safe direction: no merge beats an unauthorized one.
    await useSessionStore
      .getState()
      .upgradeAndMerge({ userId: 'auth-3', isAnonymous: false, jwt: 'jwt4' }, {
        userId: 'anon-8',
        jwt: '',
      });
    expect(mockMerge).not.toHaveBeenCalled();
  });
});

describe('signOut returns to anonymous (deferred auth)', () => {
  it('signs out then re-anon so the offline loop keeps working', async () => {
    mockSignOut.mockResolvedValue(undefined);
    mockSignInAnonymously.mockResolvedValue({ userId: 'anon-3', isAnonymous: true, jwt: 'jwt' });
    await useSessionStore.getState().signOut();
    expect(mockSignOut).toHaveBeenCalled();
    expect(useSessionStore.getState().status).toBe('anonymous');
  });
});
