export interface ChecklistItemData {
    id: string;
    label: string;
    complete: boolean;
}
export interface ChecklistProps {
    items: ChecklistItemData[];
    onToggle: (id: string) => void;
    allDoneLabel?: string;
    testID?: string;
}
export declare function Checklist({ items, onToggle, allDoneLabel, testID }: ChecklistProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Checklist.d.ts.map