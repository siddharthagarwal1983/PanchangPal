export type RitualState = 'not_started' | 'in_progress' | 'completed';
export interface RitualCardProps {
    title: string;
    descriptor: string;
    durationLabel: string;
    state: RitualState;
    /** Localized button label per state (Begin / Continue / done copy). */
    actionLabel: string;
    stateAnnouncement: string;
    onAction?: () => void;
    testID?: string;
}
export declare function RitualCard({ title, descriptor, durationLabel, state, actionLabel, stateAnnouncement, onAction, testID }: RitualCardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=RitualCard.d.ts.map