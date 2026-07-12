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
export declare function SegmentedControl<T extends string>({ options, value, onChange, accessibilityLabel, disabled, testID, }: SegmentedControlProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SegmentedControl.d.ts.map