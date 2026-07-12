/**
 * RolePicker (CMP_ROLE_PICKER, PDD §5) — single-select of a household member's role
 * {Anchor, Parent, Elder, Youth, Other}. Built on CMP_SEGMENTED so it inherits the accessible
 * radiogroup semantics (selected announced; not color-only; ≥44 targets) rather than inventing
 * a new control. The parent owns the value and supplies localized option labels; default per
 * context (self = Anchor) is decided by the caller.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { SegmentedControl, type SegmentedOption } from './SegmentedControl';

export interface RolePickerProps<T extends string> {
  /** Localized options in display order (e.g. Anchor/Parent/Elder/Youth/Other). */
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Visible + a11y group label (e.g. "Role"). */
  label: string;
  disabled?: boolean;
  testID?: string;
}

export function RolePicker<T extends string>({ options, value, onChange, label, disabled, testID }: RolePickerProps<T>) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="labelMedium" color="secondary" accessibilityRole="header">
        {label}
      </Text>
      <SegmentedControl<T>
        options={options}
        value={value}
        onChange={onChange}
        accessibilityLabel={label}
        disabled={disabled}
        testID={testID}
      />
    </View>
  );
}
