/**
 * SegmentedControl (CMP_SEGMENTED, PDD §5) — a small set of mutually exclusive options
 * rendered as an accessible radio group (tradition, depth, appearance in Settings). Not
 * color-only: the selected segment carries `accessibilityState.selected` and a filled
 * surface. Each segment is a ≥44 target. Tokens-only; the parent owns the value.
 */
import { View, Pressable, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Group label announced to assistive tech (e.g. "Tradition"). */
  accessibilityLabel?: string;
  disabled?: boolean;
  testID?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
  testID,
}: SegmentedControlProps<T>) {
  const { theme } = useTheme();
  const container: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.muted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
  };
  return (
    <View
      style={container}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const segment: ViewStyle = {
          flex: 1,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.radius.sm,
          backgroundColor: selected ? theme.colors.surface.raised : 'transparent',
          borderWidth: 1,
          borderColor: selected ? theme.colors.border.selected : 'transparent',
        };
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={option.label}
            hitSlop={4}
            style={segment}
            testID={testID ? `${testID}-${option.value}` : undefined}
          >
            <Text
              variant="labelMedium"
              color={selected ? 'brand' : 'secondary'}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
