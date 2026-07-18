export interface LegalLink {
    id: string;
    label: string;
    onPress: () => void;
}
export interface LegalFootnoteProps {
    /** Disclosure body (renewal terms for the subscription variant). */
    text: string;
    /** Labeled legal links (Terms, Privacy, …). */
    links?: LegalLink[];
    testID?: string;
}
export declare function LegalFootnote({ text, links, testID }: LegalFootnoteProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=LegalFootnote.d.ts.map