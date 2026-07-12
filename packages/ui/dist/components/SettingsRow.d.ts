/**
 * SettingsRow (CMP_SETTINGS_ROW, PDD §5) — one labeled row in a settings/profile list:
 * a title, optional description, and an optional trailing slot (value text, chevron, or a
 * control such as CMP_TOGGLE). When `onPress` is set the whole row is a single ≥44 button
 * with a merged accessibility label; otherwise it is a static container that hosts its own
 * focusable control. Tokens-only; `danger` tints destructive entries (e.g. delete account).
 */
import type { ReactNode } from 'react';
export interface SettingsRowProps {
    title: string;
    description?: string;
    /** Right-aligned value shown when there is no `trailing` control (e.g. current choice). */
    value?: string;
    /** Interactive control rendered on the right (e.g. <Toggle />); focusable on its own. */
    trailing?: ReactNode;
    onPress?: () => void;
    danger?: boolean;
    disabled?: boolean;
    testID?: string;
}
export declare function SettingsRow({ title, description, value, trailing, onPress, danger, disabled, testID, }: SettingsRowProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SettingsRow.d.ts.map