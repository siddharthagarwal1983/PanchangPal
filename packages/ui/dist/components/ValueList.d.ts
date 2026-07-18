export interface ValueListItem {
    /** Stable key + label of the benefit. */
    id: string;
    label: string;
    /** Excluded items render muted with a text equivalent; defaults to included. */
    included?: boolean;
}
export interface ValueListProps {
    items: ValueListItem[];
    /** Screen-reader text equivalent for an included row (e.g. "included"). */
    includedLabel: string;
    /** Screen-reader text equivalent for an excluded row (e.g. "not included"). */
    excludedLabel: string;
    testID?: string;
}
export declare function ValueList({ items, includedLabel, excludedLabel, testID }: ValueListProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ValueList.d.ts.map