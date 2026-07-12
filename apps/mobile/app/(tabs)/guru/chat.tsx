import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AIChatBubble, ChatInput, GuruHeader, Screen, SourceChip, Text, TypingIndicator, useTheme } from '@panchangpal/ui';
import { useOnline } from '../../../../src/data/useOnline';
import { useAskGuru } from '../../../../src/data/hooks/useAskGuru';
import { t } from '../../../../src/i18n';

export default function GuruChatScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  const { question: seeded } = useLocalSearchParams<{ question?: string }>();
  const { answer, question, ask } = useAskGuru();
  const [draft, setDraft] = useState('');
  useEffect(() => { if (seeded && !question) void ask(seeded); }, [ask, question, seeded]);
  const isDeclined = answer?.outcome === 'declined' || answer?.outcome === 'refused';
  const send = () => { const value = draft.trim(); if (!value) return; setDraft(''); void ask(value); };
  return <Screen offline={!online} scroll edges={['top']} testID="guru-chat-screen"><View style={{ gap: theme.spacing.md, paddingTop: theme.spacing.md }}><GuruHeader title={t('tabs.guru')} trustLine={t('guru.trustLine')} />{question ? <AIChatBubble author="user" text={question} /> : null}{answer?.isStreaming ? <TypingIndicator label={t('guru.thinking')} /> : null}{answer?.text ? <AIChatBubble author="assistant" text={answer.text} state={answer.isStreaming ? 'streaming' : 'complete'} /> : null}{isDeclined ? <Text accessibilityRole="alert" variant="bodyLarge">{t('guru.unavailable')}</Text> : null}{answer?.sources.map((source) => <SourceChip key={source.id} title={source.title} onPress={() => {}} />)}<ChatInput value={draft} placeholder={t('guru.inputPlaceholder')} sendLabel={t('guru.send')} disabled={!online || Boolean(answer?.isStreaming)} disabledHint={t('guru.offline')} onChangeText={setDraft} onSend={send} /></View></Screen>;
}
