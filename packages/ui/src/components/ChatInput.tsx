import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface ChatInputProps { value: string; placeholder: string; sendLabel: string; disabled?: boolean; disabledHint?: string; onChangeText: (value: string) => void; onSend: () => void; }

export function ChatInput({ value, placeholder, sendLabel, disabled = false, disabledHint, onChangeText, onSend }: ChatInputProps) {
  const { theme } = useTheme();
  return <View style={{ gap: theme.spacing.sm }}><View style={{ flexDirection: 'row', gap: theme.spacing.sm }}><TextInput value={value} placeholder={placeholder} editable={!disabled} onChangeText={onChangeText} accessibilityLabel={placeholder} multiline style={{ flex: 1, minHeight: 44, borderColor: theme.colors.border.default, borderWidth: theme.spacing.borderFocus, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.sm, color: theme.colors.text.primary }} /><Pressable accessibilityRole="button" accessibilityLabel={sendLabel} accessibilityState={{ disabled }} disabled={disabled || value.trim().length === 0} onPress={onSend} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.brand.primary }}><Text variant="labelMedium" color="onBrand">{sendLabel}</Text></Pressable></View>{disabled && disabledHint ? <Text variant="bodySmall" color="secondary">{disabledHint}</Text> : null}</View>;
}
