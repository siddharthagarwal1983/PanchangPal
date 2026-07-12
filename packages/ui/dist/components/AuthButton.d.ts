export type AuthProvider = 'apple' | 'google' | 'email';
export interface AuthButtonProps {
    provider: AuthProvider;
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    testID?: string;
}
export declare function AuthButton({ provider, label, onPress, loading, disabled, testID }: AuthButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AuthButton.d.ts.map