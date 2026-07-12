/**
 * SCR_GURU_HOME_001 — Ask Guru (MOD_guru). Shell only; the grounded-or-silent streaming
 * chat client (SSE, TDD Part 4 §7.1) is built in the Ask Guru feature task.
 */
import { Screen, AppHeader } from '@panchangpal/ui';
import { useOnline } from '../../../src/data/useOnline';
import { t } from '../../../src/i18n';

export default function GuruScreen() {
  const online = useOnline();
  return (
    <Screen offline={!online} edges={['top']} empty={{ title: t('empty.generic') }} testID="guru-screen">
      <AppHeader title={t('tabs.guru')} />
    </Screen>
  );
}
