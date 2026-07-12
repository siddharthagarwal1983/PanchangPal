/**
 * @panchangpal/ui — CMP_* component library (PDD Part 3 §5), accessibility-first (ADR-029),
 * bound to @panchangpal/design-tokens. UI never imports the data layer (TDD Part 1 §5).
 * This barrel exports the Application Shell subset (Milestone 1); more CMP_* are added in
 * the Design System / feature tasks.
 */
export { ThemeProvider, useTheme, type Appearance } from './theme';
export { Text, type TextProps } from './components/Text';
export { Screen, type ScreenProps } from './components/Screen';
export { AppHeader, type AppHeaderProps } from './components/AppHeader';
export { BottomTabBar, type TabItem } from './components/BottomTabBar';
export { Spinner } from './components/Spinner';
export { Skeleton, type SkeletonProps } from './components/Skeleton';
export { EmptyState, type EmptyStateProps } from './components/EmptyState';
export { ErrorState, type ErrorStateProps } from './components/ErrorState';
export { OfflineBanner } from './components/OfflineBanner';
export { AuthButton, type AuthProvider, type AuthButtonProps } from './components/AuthButton';
export { BrandLogo, SplashBackdrop } from './components/BrandLogo';
