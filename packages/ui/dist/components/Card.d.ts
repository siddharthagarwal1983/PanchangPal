/**
 * Card — base raised container (PDD §5.4 anatomy: surface.raised, radius.lg, elevation.card,
 * spacing.lg). Cards on Home compose this so padding/radius/border are consistent. Optional
 * `onPress` makes the whole card a labeled tap target (≥44).
 */
import type { ReactNode } from 'react';
export interface CardProps {
    children: ReactNode;
    onPress?: () => void;
    accessibilityLabel?: string;
    muted?: boolean;
    testID?: string;
}
export declare function Card({ children, onPress, accessibilityLabel, muted, testID }: CardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Card.d.ts.map