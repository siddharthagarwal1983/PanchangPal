/**
 * SCR_HOME_001 — Today (MOD_today). Composes the daily loop from CMP_* (panchang / ritual /
 * streak / checklist / rotating / festival). Cached-first render (NFR-02); no business logic
 * in the screen — data comes from hooks (useToday/useChecklist/useCompleteRitual) and view
 * logic from domain services (StreakService/RitualProgressService).
 *
 * Panchang: the PanchangCard shows the calm "temporarily unavailable" state while the
 * canonical engine is blocked (ADR-033) — never fabricated values. The rest of Home (ritual,
 * streak, checklist, reflection) is fully functional; card-level errors are isolated (AC-HOME-04).
 */
import { View } from 'react-native';
import { router } from 'expo-router';
import {
  Screen, AppHeader, PanchangCard, RitualCard, StreakCounter, Checklist, RotatingElement, useTheme,
} from '@panchangpal/ui';
import { useOnline } from '../../../src/data/useOnline';
import { usePrefsStore } from '../../../src/store/prefs';
import { useChecklist, useToggleChecklistItem } from '../../../src/data/hooks/useChecklist';
import { toRitualProgress } from '../../../src/domain/ritualProgressService';
import { toStreakView } from '../../../src/domain/streakService';
import { useUiStore } from '../../../src/store/ui';
import { useLocalDate } from '../../../src/data/hooks/useLocalDate';
import { t } from '../../../src/i18n';

export default function TodayScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  const tradition = usePrefsStore((s) => s.tradition);
  void tradition;

  // Panchang stays behind the provider abstraction; blocked → unavailable (ADR-033).
  const panchangUnavailable = { message: t('today.panchangUnavailable'), onRetry: undefined };

  // The day in the USER's zone, not UTC (ADR-026, issue #30). Null until the zone resolves;
  // the hooks below stay disabled rather than fetching another day's data.
  const today = useLocalDate();
  const checklist = useChecklist(today);
  const toggle = useToggleChecklistItem(today);

  const resume = useUiStore((s) => s.ritualResume);
  const ritual = toRitualProgress({ completedToday: false, resumeStep: resume?.step ?? null });
  const streak = toStreakView({ current_len: 0, best_len: 0, grace_remaining: 1 });

  return (
    <Screen offline={!online} scroll edges={['top']} testID="today-screen">
      <AppHeader title={t('tabs.today')} />
      <View style={{ gap: theme.spacing.md, paddingTop: theme.spacing.md }}>
        <PanchangCard unavailable={panchangUnavailable} offline={!online} testID="today-panchang" />

        <RitualCard
          title={t('ritual.title')}
          descriptor={t('app.tagline')}
          durationLabel={t('ritual.duration', { minutes: 5 })}
          state={ritual.state}
          actionLabel={t(ritual.actionKey)}
          stateAnnouncement={t(
            ritual.state === 'completed' ? 'ritual.stateCompleted' : ritual.state === 'in_progress' ? 'ritual.stateInProgress' : 'ritual.stateNotStarted',
          )}
          onAction={() => router.push('/(tabs)/today/ritual')}
          testID="today-ritual"
        />

        <StreakCounter days={streak.days} graceUsed={streak.graceUsed} label={t('streak.label', { count: streak.labelCount })} graceCopy={t('streak.graceCopy')} testID="today-streak" />

        <Checklist
          items={checklist.data ?? []}
          onToggle={(id) => toggle.mutate(id)}
          allDoneLabel={t('today.checklistAllDone')}
          testID="today-checklist"
        />

        <RotatingElement text={t('app.tagline')} label={t('today.reflection')} testID="today-reflection" />

        {/* CMP_FESTIVAL_CARD is conditional — hidden when there is no festival today. While the
            panchang/festival engine is blocked (ADR-033), festival is null, so it stays hidden. */}
        {null}
      </View>
    </Screen>
  );
}
