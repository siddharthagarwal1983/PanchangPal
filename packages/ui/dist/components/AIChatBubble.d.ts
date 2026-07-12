export interface AIChatBubbleProps {
    author: 'user' | 'assistant';
    text: string;
    state?: 'streaming' | 'complete' | 'declined' | 'refused' | 'error';
}
export declare function AIChatBubble({ author, text, state }: AIChatBubbleProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AIChatBubble.d.ts.map