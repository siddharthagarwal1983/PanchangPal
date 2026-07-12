export interface ShareButtonProps {
    /** Message body placed in the share sheet (usually the invite text + URL). */
    message: string;
    /** Optional explicit URL (iOS shows it as a link alongside the message). */
    url?: string;
    label: string;
    onShared?: () => void;
    testID?: string;
}
export declare function ShareButton({ message, url, label, onShared, testID }: ShareButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ShareButton.d.ts.map