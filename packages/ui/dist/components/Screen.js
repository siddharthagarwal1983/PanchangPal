import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { OfflineBanner } from './OfflineBanner';
export function Screen({ children, loading = false, error = null, empty = null, offline = false, scroll = false, edges = ['top', 'bottom'], testID, }) {
    const { theme } = useTheme();
    const container = { flex: 1, backgroundColor: theme.colors.surface.primary };
    const inner = { flex: 1, paddingHorizontal: theme.spacing.gutter };
    let body = children;
    if (loading)
        body = _jsx(Spinner, { testID: "screen-loading" });
    else if (error)
        body = _jsx(ErrorState, { message: error.message, onRetry: error.onRetry });
    else if (empty)
        body = _jsx(EmptyState, { title: empty.title, body: empty.body });
    return (_jsxs(SafeAreaView, { style: container, edges: edges, testID: testID, children: [offline ? _jsx(OfflineBanner, {}) : null, scroll && !loading && !error && !empty ? (_jsx(ScrollView, { style: inner, contentContainerStyle: { paddingVertical: theme.spacing.md }, children: body })) : (_jsx(View, { style: inner, children: body }))] }));
}
//# sourceMappingURL=Screen.js.map