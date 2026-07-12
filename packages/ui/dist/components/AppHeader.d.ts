/**
 * AppHeader (CMP_APP_HEADER) — screen/app header (PDD §5.5). Title (titleLarge) with
 * optional leading (back) + trailing action slots, elevated surface + hairline on scroll.
 * Back affordance is a ≥44/48 target with an explicit label.
 */
import type { ReactNode } from 'react';
export interface AppHeaderProps {
    title: string;
    onBack?: () => void;
    backLabel?: string;
    trailing?: ReactNode;
    testID?: string;
}
export declare function AppHeader({ title, onBack, backLabel, trailing, testID }: AppHeaderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AppHeader.d.ts.map