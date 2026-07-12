/**
 * EmptyState (CMP_EMPTY_STATE) — calm, non-alarming empty state (PDD §5.13). Centered,
 * generous vertical rhythm (spacing.xxl), optional action slot.
 */
import type { ReactNode } from 'react';
export interface EmptyStateProps {
    title: string;
    body?: string;
    action?: ReactNode;
    testID?: string;
}
export declare function EmptyState({ title, body, action, testID }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=EmptyState.d.ts.map