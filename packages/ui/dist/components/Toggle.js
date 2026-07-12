import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Toggle (CMP_TOGGLE, PDD §5) — an accessible on/off switch atom used by settings rows
 * (sound, per-channel notification prefs later). Wraps the native Switch with token colors
 * and role=switch so VoiceOver/TalkBack announce state; respects the disabled state. The
 * parent owns the value; label/description live on the enclosing CMP_SETTINGS_ROW.
 */
import { Switch } from 'react-native';
import { useTheme } from '../theme';
export function Toggle({ value, onValueChange, accessibilityLabel, disabled = false, testID }) {
    const { theme } = useTheme();
    return (_jsx(Switch, { value: value, onValueChange: onValueChange, disabled: disabled, accessibilityRole: "switch", accessibilityLabel: accessibilityLabel, accessibilityState: { checked: value, disabled }, trackColor: { false: theme.colors.state.trackOff, true: theme.colors.brand.primary }, thumbColor: theme.colors.surface.raised, ios_backgroundColor: theme.colors.state.trackOff, testID: testID }));
}
//# sourceMappingURL=Toggle.js.map