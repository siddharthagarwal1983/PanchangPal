export interface ChatInputProps {
    value: string;
    placeholder: string;
    sendLabel: string;
    disabled?: boolean;
    disabledHint?: string;
    onChangeText: (value: string) => void;
    onSend: () => void;
}
export declare function ChatInput({ value, placeholder, sendLabel, disabled, disabledHint, onChangeText, onSend }: ChatInputProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ChatInput.d.ts.map