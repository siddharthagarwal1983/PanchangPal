/**
 * CMP_BOTTOM_SHEET (PDD §5.12 — Overlays & Feedback). Contextual modal surface anchored to the
 * bottom: grabber, title, content, actions; `radius.lg` top corners over a scrim. Presentational
 * only — the opener owns visibility and what the sheet contains.
 *
 * Dismissal: scrim tap and hardware back close the sheet UNLESS `dismissible={false}`
 * (required-decision), which blocks both so the caller's action is the only exit. Per PDD §4 the
 * sheet slides up with a scrim fade; under Reduced Motion it fades in place instead — pass
 * `reduceMotion` (the ui package stays presentational, so the signal comes from the opener).
 *
 * Accessibility: the sheet is an `accessibilityViewIsModal` dialog, so SR focus is trapped inside
 * and returns to the opener on close; the title labels the dialog for SR announcement.
 */
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type BottomSheetHeight = 'auto' | 'half' | 'full';

export interface BottomSheetProps {
  visible: boolean;
  /** Sheet title — labels the dialog for screen readers (PDD a11y). */
  title: string;
  /** `auto` hugs content; `half`/`full` claim a fixed share of the screen. */
  height?: BottomSheetHeight;
  /**
   * `false` = required-decision: scrim tap and back are ignored, so the sheet closes only via a
   * caller-provided action. Defaults to true — paywalls are ALWAYS dismissible (AC-SUB-01).
   */
  dismissible?: boolean;
  /** Fade in place instead of sliding up (Reduced Motion, PDD §4). */
  reduceMotion?: boolean;
  onDismiss: () => void;
  children: ReactNode;
  testID?: string;
}

const HEIGHT_STYLE: Record<BottomSheetHeight, ViewStyle> = {
  auto: {},
  half: { height: '50%' },
  full: { height: '90%' },
};

export function BottomSheet({
  visible,
  title,
  height = 'auto',
  dismissible = true,
  reduceMotion = false,
  onDismiss,
  children,
  testID,
}: BottomSheetProps) {
  const { theme } = useTheme();

  // A required-decision sheet ignores scrim/back; only a caller action closes it.
  const requestDismiss = () => {
    if (dismissible) onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'fade' : 'slide'}
      onRequestClose={requestDismiss}
      testID={testID}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Scrim — tap-to-dismiss when dismissible. Hidden from SR: the sheet is the modal. */}
        <Pressable
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          onPress={requestDismiss}
          style={{ ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.scrim }}
          testID={testID ? `${testID}-scrim` : undefined}
        />

        <View
          accessibilityViewIsModal
          accessibilityRole="none"
          accessibilityLabel={title}
          style={{
            backgroundColor: theme.colors.surface.raised,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.sm,
            paddingBottom: theme.spacing.xl,
            gap: theme.spacing.md,
            ...HEIGHT_STYLE[height],
          }}
          testID={testID ? `${testID}-surface` : undefined}
        >
          {/* Grabber — decorative affordance, never announced. */}
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              alignSelf: 'center',
              width: 36,
              height: 4,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.border.default,
            }}
          />

          <Text variant="titleLarge" color="primary" accessibilityRole="header">
            {title}
          </Text>

          {children}
        </View>
      </View>
    </Modal>
  );
}
