/**
 * Screen (CMP_SCREEN) — the standard screen container. Applies safe-area insets, the warm
 * app background, screen gutter, and renders unified loading / empty / error / offline
 * states so every screen supports them consistently (milestone requirement; PDD §5 global
 * rules). Content is only shown when not loading/error and (optionally) not empty.
 */
import type { ReactNode } from 'react';
import { View, ScrollView, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { OfflineBanner } from './OfflineBanner';

export interface ScreenProps {
  children?: ReactNode;
  loading?: boolean;
  error?: { message: string; onRetry?: () => void } | null;
  empty?: { title: string; body?: string } | null;
  offline?: boolean;
  scroll?: boolean;
  edges?: readonly Edge[];
  testID?: string;
}

export function Screen({
  children,
  loading = false,
  error = null,
  empty = null,
  offline = false,
  scroll = false,
  edges = ['top', 'bottom'],
  testID,
}: ScreenProps) {
  const { theme } = useTheme();
  const container: ViewStyle = { flex: 1, backgroundColor: theme.colors.surface.primary };
  const inner: ViewStyle = { flex: 1, paddingHorizontal: theme.spacing.gutter };

  let body: ReactNode = children;
  if (loading) body = <Spinner testID="screen-loading" />;
  else if (error) body = <ErrorState message={error.message} onRetry={error.onRetry} />;
  else if (empty) body = <EmptyState title={empty.title} body={empty.body} />;

  return (
    <SafeAreaView style={container} edges={edges} testID={testID}>
      {offline ? <OfflineBanner /> : null}
      {scroll && !loading && !error && !empty ? (
        <ScrollView style={inner} contentContainerStyle={{ paddingVertical: theme.spacing.md }}>
          {body}
        </ScrollView>
      ) : (
        <View style={inner}>{body}</View>
      )}
    </SafeAreaView>
  );
}
