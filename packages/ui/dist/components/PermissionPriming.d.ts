export type PermissionKind = 'notification' | 'location';
export interface PermissionPrimingProps {
    kind?: PermissionKind;
    title: string;
    body: string;
    /** Primary CTA label — pressing this is what may trigger the OS dialog. */
    allowLabel: string;
    /** Secondary CTA label — must never trigger the OS dialog. */
    notNowLabel: string;
    onAllow: () => void;
    onNotNow: () => void;
    loading?: boolean;
    testID?: string;
}
export declare function PermissionPriming({ title, body, allowLabel, notNowLabel, onAllow, onNotNow, loading, testID, }: PermissionPrimingProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PermissionPriming.d.ts.map