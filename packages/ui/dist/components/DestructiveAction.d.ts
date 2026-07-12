export interface DestructiveActionProps {
    label: string;
    confirmTitle: string;
    confirmBody: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    disabled?: boolean;
    loading?: boolean;
    testID?: string;
}
export declare function DestructiveAction({ label, confirmTitle, confirmBody, confirmLabel, cancelLabel, onConfirm, disabled, loading, testID, }: DestructiveActionProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=DestructiveAction.d.ts.map