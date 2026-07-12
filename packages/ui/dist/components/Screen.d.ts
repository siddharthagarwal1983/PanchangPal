/**
 * Screen (CMP_SCREEN) — the standard screen container. Applies safe-area insets, the warm
 * app background, screen gutter, and renders unified loading / empty / error / offline
 * states so every screen supports them consistently (milestone requirement; PDD §5 global
 * rules). Content is only shown when not loading/error and (optionally) not empty.
 */
import type { ReactNode } from 'react';
import { type Edge } from 'react-native-safe-area-context';
export interface ScreenProps {
    children?: ReactNode;
    loading?: boolean;
    error?: {
        message: string;
        onRetry?: () => void;
    } | null;
    empty?: {
        title: string;
        body?: string;
    } | null;
    offline?: boolean;
    scroll?: boolean;
    edges?: readonly Edge[];
    testID?: string;
}
export declare function Screen({ children, loading, error, empty, offline, scroll, edges, testID, }: ScreenProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Screen.d.ts.map