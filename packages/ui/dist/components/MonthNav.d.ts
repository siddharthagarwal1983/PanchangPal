export interface MonthNavProps {
    label: string;
    previousLabel: string;
    nextLabel: string;
    todayLabel: string;
    onPrevious: () => void;
    onNext: () => void;
    onToday: () => void;
    testID?: string;
}
export declare function MonthNav({ label, previousLabel, nextLabel, todayLabel, onPrevious, onNext, onToday, testID }: MonthNavProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=MonthNav.d.ts.map