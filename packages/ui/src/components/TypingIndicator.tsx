import { Text } from './Text';

export function TypingIndicator({ label }: { label: string }) { return <Text accessibilityLiveRegion="polite" accessibilityLabel={label} variant="bodyMedium" color="secondary">{label}</Text>; }
