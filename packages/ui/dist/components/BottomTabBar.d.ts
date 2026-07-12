export interface TabItem {
    key: string;
    label: string;
    focused: boolean;
    onPress: () => void;
    testID?: string;
}
export declare function BottomTabBar({ items }: {
    items: TabItem[];
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=BottomTabBar.d.ts.map