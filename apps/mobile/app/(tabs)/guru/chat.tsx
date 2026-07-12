/**
 * SCR_GURU_CHAT_001 — Ask Guru conversation (TDD Part 4 §7.1; PDD §9). Streams the answer from
 * the server SSE adapter and renders trust-safe states: thinking (typing indicator) → streaming
 * bubble → sources, OR an honest outcome. The SERVER owns the outcome; the client never
 * fabricates. Outcomes are distinguished per PDD §5.4: refused (out-of-scope), declined
 * (low-confidence), error (calm retry). Offline disables input; a mid-stream drop surfaces as a
 * calm error with retry, never a half-sentence presented as complete.
 */
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AIChatBubble, ChatInput, GuruHeader, PrimaryButton, Screen, SourceChip, Text, TypingIndicator, useTheme } from '@panchangpal/ui';
import { useOnline } from '../../../src/data/useOnline';
import { useAskGuru } from '../../../src/data/hooks/useAskGuru';
import { t } from '../../../src/i18n';

export default function GuruChatScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  const { question: seeded } = useLocalSearchParams<{ question?: string }>();
  const { answer, question, ask, retry } = useAskGuru();
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (seeded && !question) void ask(seeded);
  }, [ask, question, seeded]);

  const send = () => {
    const value = draft.trim();
    if (!value) return;
    setDraft('');
    void ask(value);
  };

  // Server-owned outcome → trust-safe copy (PDD §5.4). Never fabricated.
  const outcome = answer && !answer.isStreaming ? answer.outcome : null;
  const outcomeCopy =
    outcome === 'refused' ? t('guru.refused') : outcome === 'declined' ? t('guru.declined') : outcome === 'error' ? t('guru.error') : null;
  const showRetry = outcome === 'error';

  return (
    <Screen offline={!online} scroll edges={['top']} testID="guru-chat-screen">
      <View style={{ gap: theme.spacing.md, paddingTop: theme.spacing.md }}>
        <GuruHeader title={t('tabs.guru')} trustLine={t('guru.trustLine')} />

        {question ? <AIChatBubble author="user" text={question} /> : null}

        {answer?.isStreaming && !answer.text ? <TypingIndicator label={t('guru.thinking')} /> : null}

        {/* Only render the answer bubble for grounded content; declines/refusals/errors use the
            calm outcome notice below (never present an unverified answer as fact). */}
        {answer?.text && (answer.isStreaming || answer.outcome === 'grounded') ? (
          <AIChatBubble author="assistant" text={answer.text} state={answer.isStreaming ? 'streaming' : 'complete'} />
        ) : null}

        {answer?.outcome === 'grounded' ? answer.sources.map((s) => <SourceChip key={s.id} title={s.title} onPress={() => { }} />) : null}

        {outcomeCopy ? (
          <View accessibilityRole="alert" style={{ gap: theme.spacing.sm }}>
            <Text variant="bodyLarge" color="primary">
              {outcomeCopy}
            </Text>
            {showRetry ? <PrimaryButton label={t('guru.retry')} onPress={retry} testID="guru-retry" /> : null}
          </View>
        ) : null}

        <ChatInput
          value={draft}
          placeholder={t('guru.inputPlaceholder')}
          sendLabel={t('guru.send')}
          disabled={!online || Boolean(answer?.isStreaming)}
          disabledHint={t('guru.offline')}
          onChangeText={setDraft}
          onSend={send}
        />
      </View>
    </Screen>
  );
}
