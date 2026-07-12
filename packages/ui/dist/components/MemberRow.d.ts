export interface MemberRowProps {
    /** Precomputed initials (1–2 chars); the avatar is decorative, so names live in the label. */
    initials: string;
    name: string;
    /** Localized "{role} · {depth}" subtitle, e.g. "Elder · Deep". */
    subtitle: string;
    /** When set, an owner-only remove button is shown with this accessible label. */
    onRemove?: () => void;
    removeLabel?: string;
    /** Marks the household owner (announced in the a11y label; no color-only meaning). */
    ownerBadgeLabel?: string;
    testID?: string;
}
export declare function MemberRow({ initials, name, subtitle, onRemove, removeLabel, ownerBadgeLabel, testID }: MemberRowProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=MemberRow.d.ts.map