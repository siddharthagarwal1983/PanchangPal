export interface TraditionOption {
    value: string;
    label: string;
}
export interface TraditionSwitcherProps {
    selected: string;
    options: readonly TraditionOption[];
    label: string;
    onSelect: (value: string) => void;
    testID?: string;
}
export declare function TraditionSwitcher({ selected, options, label, onSelect, testID }: TraditionSwitcherProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TraditionSwitcher.d.ts.map