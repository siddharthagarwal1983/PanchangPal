/**
 * SCR_CALENDAR_001 — Calendar (MOD_calendar). Shell only; calendar/festivals/personal dates
 * are built in the Calendar feature task. Festivals live under this tab (frozen IA UX-1).
 */
import { Screen, AppHeader } from '@panchangpal/ui';
import { useOnline } from '../../../src/data/useOnline';
import { t } from '../../../src/i18n';

export default function CalendarScreen() {
  const online = useOnline();
  return (
    <Screen offline={!online} edges={['top']} empty={{ title: t('empty.generic') }} testID="calendar-screen">
      <AppHeader title={t('tabs.calendar')} />
    </Screen>
  );
}
