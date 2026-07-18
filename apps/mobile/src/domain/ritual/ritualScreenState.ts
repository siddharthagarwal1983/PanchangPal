/**
 * Which state SCR_RITUAL_001 should render (PDD screen template: Loading / Empty / Error /
 * Ready). Pure, so the ORDER of the checks is assertable — the order was the defect.
 *
 * The screen previously tested `!view` first, which swallowed everything else: a query
 * error, or simply no ritual for today, both left `view` null and the screen sat on its
 * spinner forever. The written error branch below it was unreachable dead code, and there
 * was no empty branch at all.
 */
export interface RitualScreenInput {
  /** The ritual query is still in flight. */
  isLoading: boolean;
  /** The ritual query failed. */
  hasError: boolean;
  /** A ritual exists for today. */
  hasData: boolean;
  /** The engine has produced a view model. */
  hasView: boolean;
  /** Session restore rejected — e.g. local storage unavailable. */
  restoreFailed: boolean;
}

export type RitualScreenState = 'error' | 'loading' | 'empty' | 'ready';

export function resolveRitualScreenState({
  isLoading,
  hasError,
  hasData,
  hasView,
  restoreFailed,
}: RitualScreenInput): RitualScreenState {
  // Failures win. A restore rejection used to be indistinguishable from loading, which is
  // how a storage failure became a permanent spinner with nothing logged.
  if (hasError || restoreFailed) return 'error';
  if (isLoading) return 'loading';
  // Settled with no ritual — a real, expected state, not a stalled fetch.
  if (!hasData) return 'empty';
  // Data present, engine still restoring.
  if (!hasView) return 'loading';
  return 'ready';
}
