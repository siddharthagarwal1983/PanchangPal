/**
 * SCR_RITUAL_001. This route only renders RitualEngine view models and forwards user intents;
 * all navigation/progress/session transitions live in the reusable domain engine.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CompletionMoment, PrimaryButton, RitualIntro, RitualStep, Screen, Text, useTheme } from '@panchangpal/ui';
import { RitualEngine, NullAudioAdapter, resolveRitualScreenState, type RitualPlayerViewModel } from '../../../src/domain/ritual';
import { getRitualSessionRepository } from '../../../src/data/ritualSessionRepository';
import { useRitualToday } from '../../../src/data/hooks/useRitualToday';
import { useCompleteRitual } from '../../../src/data/hooks/useCompleteRitual';
import { usePrefsStore } from '../../../src/store/prefs';
import { useLocalDate } from '../../../src/data/hooks/useLocalDate';
import { t } from '../../../src/i18n';

export default function RitualScreen() {
  const { theme } = useTheme();
  const tradition = usePrefsStore((state) => state.tradition);
  const depth = usePrefsStore((state) => state.depth);
  const ritual = useRitualToday(tradition, depth);
  // The day in the USER's zone (ADR-026, issue #30). It keys the stored session, so a UTC
  // value did not merely mislabel the day — after a rollover it pointed at a different
  // session entirely.
  const today = useLocalDate();
  const completion = useCompleteRitual(today);
  const engine = useRef<RitualEngine | null>(null);
  const [view, setView] = useState<RitualPlayerViewModel | null>(null);

  const [restoreFailed, setRestoreFailed] = useState(false);

  useEffect(() => {
    let active = true;
    // Wait for BOTH the ritual definition and the local date. Restoring against a guessed day
    // would load the wrong session — or none — and then save progress under that wrong key.
    if (!ritual.data || !today) return undefined;
    // Both outcomes are set from the async handlers, never synchronously in the effect
    // body — a sync setState here triggers cascading renders (react-hooks/set-state-in-effect).
    // The rejection path MUST be handled. Session restore reads local storage, and a
    // storage failure previously left `view` null forever — the screen sat on its spinner
    // with no error and no log, because the render guard below treats "no view" as
    // "still loading". A visible error beats a silent hang.
    // Starting from a resolved promise converts a SYNCHRONOUS throw into a rejection, so
    // one .catch() covers both. Building the repository or the adapter can throw before any
    // promise exists — exactly how the missing native storage module escaped the rejection
    // handler and crashed the screen through the ErrorBoundary. A plain try/catch would
    // work too, but its setState would run synchronously inside the effect
    // (react-hooks/set-state-in-effect).
    const definition = ritual.data;
    void Promise.resolve()
      .then(() => RitualEngine.restore(definition, today, getRitualSessionRepository(), new NullAudioAdapter()))
      .then((restored) => {
        if (!active) return;
        engine.current = restored;
        setRestoreFailed(false);
        setView(restored.view());
      })
      .catch(() => {
        if (!active) return;
        setRestoreFailed(true);
      });
    return () => { active = false; };
    // `today` is a dependency on purpose: when the day rolls over while the app is open, the
    // session key changes and the engine must re-restore against the NEW day rather than keep
    // writing progress into yesterday's session.
  }, [ritual.data, today]);

  const dispatch = useCallback(async (intent: (value: RitualEngine) => Promise<void>) => {
    if (!engine.current) return;
    await intent(engine.current);
    const next = engine.current.view();
    setView(next);
    if (next.state === 'completed' && !next.completionRecorded && ritual.data) {
      completion.mutate(ritual.data.id);
      await engine.current.markCompletionRecorded();
      setView(engine.current.view());
    }
  }, [completion, ritual.data]);

  // Ordering lives in resolveRitualScreenState so it can be unit-tested — the ORDER was the
  // defect: `!view` was tested first and swallowed both the error and the empty case.
  const screenState = resolveRitualScreenState({
    // An unresolved time zone is a loading state, not an error and not an empty ritual: the
    // screen simply does not yet know which day's session to show (ADR-026).
    isLoading: ritual.isLoading || !today,
    hasError: Boolean(ritual.error),
    hasData: Boolean(ritual.data),
    hasView: Boolean(view),
    restoreFailed,
  });

  if (screenState === 'error') {
    return <Screen error={{ message: t('errors.unknown') }} edges={['top']} testID="ritual-error" />;
  }
  if (screenState === 'loading') return <Screen loading edges={['top']} testID="ritual-loading" />;
  if (screenState === 'empty') {
    return (
      <Screen edges={['top']} testID="ritual-empty">
        <View accessibilityRole="alert" style={{ gap: theme.spacing.xs, paddingTop: theme.spacing.lg }}>
          <Text variant="bodyMedium">{t('ritual.unavailable')}</Text>
          <Text variant="bodySmall" color="secondary">{t('ritual.unavailableDetail')}</Text>
        </View>
        <View style={{ paddingTop: theme.spacing.lg }}>
          <PrimaryButton label={t('ritual.returnToday')} onPress={() => router.back()} testID="ritual-empty-back" />
        </View>
      </Screen>
    );
  }

  // Unreachable: 'ready' is only returned when hasView. Present so TypeScript can narrow
  // `view`, and so a future change to the resolver degrades to the spinner rather than
  // crashing on a null dereference.
  if (!view) return <Screen loading edges={['top']} testID="ritual-loading" />;

  return (
    <Screen edges={['top', 'bottom']} testID="ritual-screen">
      <View style={{ flex: 1, backgroundColor: theme.colors.surface.immersive, marginHorizontal: -theme.spacing.gutter, padding: theme.spacing.gutter, justifyContent: 'center' }}>
        {view.state === 'intro' ? <RitualIntro title={view.title} body={view.intro} beginLabel={t('ritual.beginGuidance')} onBegin={() => void dispatch((value) => value.begin())} /> : null}
        {view.state === 'active' && view.step && view.stepNumber ? <View style={{ gap: theme.spacing.md }}>
          <RitualStep text={view.step.text} current={view.stepNumber} total={view.totalSteps} progressLabel={t('ritual.progress', { current: view.stepNumber, total: view.totalSteps })} nextLabel={view.stepNumber === view.totalSteps ? t('ritual.complete') : t('ritual.next')} skipLabel={t('ritual.skip')} playLabel={t('ritual.playAudio')} audioUnavailableLabel={t('ritual.audioUnavailable')} audioAvailable={view.audioAvailable} canSkip={view.canSkip} onNext={() => void dispatch((value) => value.next())} onSkip={() => void dispatch((value) => value.skip())} onPlayAudio={() => void dispatch((value) => value.toggleAudio())} />
          <PrimaryButton label={t('ritual.pause')} onPress={() => void dispatch((value) => value.pause())} />
          <PrimaryButton label={t('ritual.leave')} onPress={() => void dispatch(async (value) => { await value.leave(); router.back(); })} />
        </View> : null}
        {view.state === 'paused' ? <View style={{ gap: theme.spacing.md }}><PrimaryButton label={t('ritual.resume')} onPress={() => void dispatch((value) => value.resume())} /><PrimaryButton label={t('ritual.leave')} onPress={() => void dispatch(async (value) => { await value.leave(); router.back(); })} /></View> : null}
        {view.state === 'completed' ? <CompletionMoment title={t('ritual.completeTitle')} body={t('ritual.completeBody')} continueLabel={t('ritual.returnToday')} onContinue={() => router.replace('/(tabs)/today')} /> : null}
      </View>
    </Screen>
  );
}
