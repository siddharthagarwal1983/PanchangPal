export interface PanchangSummary {
    dateLabel: string;
    city: string;
    tithi: string;
    nakshatra: string;
    festivalHint?: string;
}
export interface PanchangCardProps {
    data?: PanchangSummary | null;
    loading?: boolean;
    offline?: boolean;
    /** Engine blocked (ADR-033) or fetch failed → show the calm unavailable state, not data. */
    unavailable?: {
        message: string;
        onRetry?: () => void;
    } | null;
    onPress?: () => void;
    openLabel?: string;
    retryLabel?: string;
    testID?: string;
}
export declare function PanchangCard({ data, loading, offline, unavailable, onPress, openLabel, retryLabel, testID, }: PanchangCardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PanchangCard.d.ts.map