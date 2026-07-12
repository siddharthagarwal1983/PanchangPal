export interface MonthGridDay {
    key: string;
    day: number;
    label: string;
    today?: boolean;
}
export interface MonthGridProps {
    weekdayLabels: readonly string[];
    leadingBlankCells: number;
    days: readonly MonthGridDay[];
    selectedDate?: string | null;
    onSelectDay: (date: string) => void;
    testID?: string;
}
export declare function MonthGrid({ weekdayLabels, leadingBlankCells, days, selectedDate, onSelectDay, testID }: MonthGridProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=MonthGrid.d.ts.map