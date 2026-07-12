/**
 * SCR_GURU_HISTORY_001 — Ask Guru history. Lists the user's own past questions + the server's
 * outcome (grounded/declined/refused/error) from local cache — never a fabricated answer, no
 * cross-session memory (owner-only, TDD Part 4 §7.1). Tapping a row reopens that question.
 */
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen, AppHeader, ConversationRow, useTheme } from '@panchangpal/ui';
import type { GuruOutcome } from '../../../../src/domain/guru';
import { useGuruHistory } from '../../../../src/data/hooks/useGuruHistory';
import { t } from '../../../../src/i18n';

const OUTCOME_KEY: Record<GuruOutcome, string> = {
  grounded: 'guru.outcomeGrounded',
  declined: 'guru.outcomeDeclined',
  refused: 'guru.outcomeRefused',
  error: 'guru.outcomeError',
};

export default function GuruHistoryScreen() {
  const { theme } = useTheme();
  const { items } = useGuruHistory();
  const fmt = (iso: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(iso));

  if (items.length === 0) {
    return (
      <Screen edges={['top']} empty={{ title: t('guru.historyEmpty') }} testID="guru-history-screen">
        <AppHeader title={t('guru.history')} />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['top']} testID="guru-history-screen">
      <AppHeader title={t('guru.history')} />
      <View style={{ paddingTop: theme.spacing.sm }}>
        {items.map((c) => (
          <ConversationRow
            key={c.id}
            question={c.question}
            outcomeLabel={t(OUTCOME_KEY[c.outcome])}
            timeLabel={fmt(c.createdAt)}
            onPress={() => router.push({ pathname: '/(tabs)/guru/chat', params: { question: c.question } })}
            testID={`history-row-${c.id}`}
          />
        ))}
      </View>
    </Screen>
  );
}
