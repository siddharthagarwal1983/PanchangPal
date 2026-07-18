import { type ValueListItem } from './ValueList';
export interface PlanCardProps {
    /** Plan/offering id (passed back on select). */
    id: string;
    /** Localized plan name (e.g. "Individual", "Family"). */
    name: string;
    /** Store-localized price string (never hardcoded), e.g. "$4.99". */
    priceLabel: string;
    /** Localized cadence, e.g. "per month". */
    periodLabel: string;
    /** Inclusions rendered via CMP_VALUE_LIST. */
    benefits: ValueListItem[];
    includedLabel: string;
    excludedLabel: string;
    /** When set, shown as a text badge (e.g. "Best value") — text, not color. */
    bestValueLabel?: string;
    selected?: boolean;
    /** Disables selection while a purchase is in flight. */
    loading?: boolean;
    onSelect: (id: string) => void;
    testID?: string;
}
export declare function PlanCard({ id, name, priceLabel, periodLabel, benefits, includedLabel, excludedLabel, bestValueLabel, selected, loading, onSelect, testID, }: PlanCardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PlanCard.d.ts.map