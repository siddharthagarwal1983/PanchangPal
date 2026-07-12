/**
 * SCR_RITUAL_001. This route only renders RitualEngine view models and forwards user intents;
 * all navigation/progress/session transitions live in the reusable domain engine.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CompletionMoment, PrimaryButton, RitualIntro, RitualStep, Screen, useTheme } from '@panchangpal/ui';
import { RitualEngine, NullAudioAdapter, type RitualPlayerViewModel } from '../../../../src/domain/ritual';
import { getRitualSessionRepository } from '../../../../src/data/ritualSessionRepository';
import { useRitualToday } from '../../../../src/data/hooks/useRitualToday';
import { useCompleteRitual } from '../../../../src/data/hooks/useCompleteRitual';
import { usePrefsStore } from '../../../../src/store/prefs';
import { t } from '../../../../src/i18n';

const TODAY = new Date().toISOString().slice(0, 10);

export default function RitualScreen() {
  const { theme } = useTheme();
  const tradition = usePrefsStore((state) => state.tradition);
  const depth = usePrefsStore((state) => state.depth);
  const ritual = useRitualToday(tradition, depth);
  const completion = useCompleteRitual(TODAY);
  const engine = useRef<RitualEngine | null>(null);
  const [view, setView] = useState<RitualPlayerViewModel | null>(null);

  useEffect(() => {
    let active = true;
    if (!ritual.data) return undefined;
    void RitualEngine.restore(ritual.data, TODAY, getRitualSessionRepository(), new NullAudioAdapter()).then((restored) => {
      if (!active) return;
      engine.current = restored;
      setView(restored.view());
    });
    return () => { active = false; };
  }, [ritual.data]);

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

  if (ritual.isLoading || !view) return <Screen loading edges={['top']} testID="ritual-loading" />;
  if (ritual.error) return <Screen error={{ message: t('errors.unknown') }} edges={['top']} testID="ritual-error" />;

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
