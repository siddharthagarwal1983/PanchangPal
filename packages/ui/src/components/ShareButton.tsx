/**
 * ShareButton (CMP_SHARE_BUTTON, PDD §5) — opens the OS share sheet with an invite payload
 * (link / greeting). Uses the platform Share API so the sheet inherits native a11y. Any error
 * (e.g. user dismissal) is swallowed — sharing is best-effort and never blocks the flow.
 */
import { Pressable, Share, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface ShareButtonProps {
  /** Message body placed in the share sheet (usually the invite text + URL). */
  message: string;
  /** Optional explicit URL (iOS shows it as a link alongside the message). */
  url?: string;
  label: string;
  onShared?: () => void;
  testID?: string;
}

export function ShareButton({ message, url, label, onShared, testID }: ShareButtonProps) {
  const { theme } = useTheme();
  const style: ViewStyle = {
    minHeight: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
  };
  const onPress = async () => {
    try {
      await Share.share(url ? { message, url } : { message });
      onShared?.();
    } catch {
      // best-effort; dismissal or unavailable sheet is a no-op
    }
  };
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={style} testID={testID}>
      <Text variant="labelLarge" color="brand">
        {label}
      </Text>
    </Pressable>
  );
}
