import { resolveRitualScreenState, type RitualScreenInput } from '../ritual';

const base: RitualScreenInput = {
  isLoading: false,
  hasError: false,
  hasData: true,
  hasView: true,
  restoreFailed: false,
};

describe('resolveRitualScreenState', () => {
  it('renders the ritual once data and a view exist', () => {
    expect(resolveRitualScreenState(base)).toBe('ready');
  });

  it('shows empty — not a spinner — when today has no ritual', () => {
    // Regression: this is exactly staging's state (the ritual table is empty). The screen
    // used to test `!view` first, so it spun forever instead of saying anything.
    expect(resolveRitualScreenState({ ...base, hasData: false, hasView: false })).toBe('empty');
  });

  it('shows the error state when the query fails', () => {
    // Regression: the error branch sat BELOW the `!view` guard and was unreachable, because
    // a failed query also leaves view null.
    expect(resolveRitualScreenState({ ...base, hasError: true, hasView: false })).toBe('error');
  });

  it('shows the error state when session restore rejects', () => {
    // Regression: the restore promise had no .catch(), so a storage failure produced a
    // permanent spinner with no error and no log. Matters most in a real build, where
    // MMKV exists and can still fail at runtime.
    expect(resolveRitualScreenState({ ...base, restoreFailed: true, hasView: false })).toBe('error');
  });

  it('prefers the error state over loading', () => {
    expect(resolveRitualScreenState({ ...base, isLoading: true, hasError: true })).toBe('error');
  });

  it('prefers the error state over empty', () => {
    expect(resolveRitualScreenState({ ...base, hasData: false, hasError: true })).toBe('error');
  });

  it('loads while the query is in flight, even before data arrives', () => {
    expect(resolveRitualScreenState({ ...base, isLoading: true, hasData: false, hasView: false })).toBe('loading');
  });

  it('loads while the engine restores a ritual that does exist', () => {
    expect(resolveRitualScreenState({ ...base, hasView: false })).toBe('loading');
  });
});
