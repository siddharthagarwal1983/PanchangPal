import { Screen, AppHeader } from '@panchangpal/ui';
import { t } from '../../../../src/i18n';

export default function GuruHistoryScreen() { return <Screen edges={['top']} empty={{ title: t('guru.historyEmpty') }} testID="guru-history-screen"><AppHeader title={t('guru.history')} /></Screen>; }
