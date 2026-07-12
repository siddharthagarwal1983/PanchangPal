export interface DayCellProps {
    day: number;
    label: string;
    selected?: boolean;
    today?: boolean;
    onPress: () => void;
    testID?: string;
}
export declare function DayCell({ day, label, selected, today, onPress, testID }: DayCellProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=DayCell.d.ts.map