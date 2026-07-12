/**
 * SCR_GURU_HOME_001 — Ask Guru (MOD_guru). Shell only; the grounded-or-silent streaming
 * chat client (SSE, TDD Part 4 §7.1) is built in the Ask Guru feature task.
 */
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, AppHeader, ChatInput, GuruHeader, Text, useTheme } from '@panchangpal/ui';
import { useOnline } from '../../../src/data/useOnline';
import { t } from '../../../src/i18n';

export default function GuruScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  const [question, setQuestion] = useState('');
  const starters = [t('guru.starterDaily'), t('guru.starterTithi'), t('guru.starterKids')];
  const openChat = (value: string) => router.push({ pathname: '/(tabs)/guru/chat', params: { question: value } });
  return (
    <Screen offline={!online} scroll edges={['top']} testID="guru-screen">
      <AppHeader title={t('tabs.guru')} />
      <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
        <GuruHeader title={t('tabs.guru')} trustLine={t('guru.trustLine')} />
        <View style={{ gap: theme.spacing.sm }}>{starters.map((starter) => <Pressable key={starter} accessibilityRole="button" accessibilityLabel={starter} onPress={() => openChat(starter)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.chip }}><Text variant="bodyMedium">{starter}</Text></Pressable>)}</View>
        <ChatInput value={question} placeholder={t('guru.inputPlaceholder')} sendLabel={t('guru.send')} disabled={!online} disabledHint={t('guru.offline')} onChangeText={setQuestion} onSend={() => openChat(question.trim())} />
        <Pressable accessibilityRole="button" accessibilityLabel={t('guru.history')} onPress={() => router.push('/(tabs)/guru/history')} style={{ minHeight: 44, justifyContent: 'center' }}><Text variant="labelMedium" color="brand">{t('guru.history')}</Text></Pressable>
      </View>
    </Screen>
  );
}
