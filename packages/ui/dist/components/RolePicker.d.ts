import { type SegmentedOption } from './SegmentedControl';
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
export declare function RolePicker<T extends string>({ options, value, onChange, label, disabled, testID }: RolePickerProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=RolePicker.d.ts.map