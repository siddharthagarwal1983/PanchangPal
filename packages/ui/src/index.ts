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
// Today (MOD_today) — Milestone 2
export { Card, type CardProps } from './components/Card';
export { PrimaryButton, type PrimaryButtonProps } from './components/PrimaryButton';
export { LocationChip } from './components/LocationChip';
export { PanchangCard, type PanchangCardProps, type PanchangSummary } from './components/PanchangCard';
export { RitualCard, type RitualCardProps, type RitualState } from './components/RitualCard';
export { StreakCounter, type StreakCounterProps } from './components/StreakCounter';
export { Checklist, type ChecklistProps, type ChecklistItemData } from './components/Checklist';
export { RotatingElement, type RotatingType } from './components/RotatingElement';
export { FestivalCard, type FestivalCardProps } from './components/FestivalCard';
// Guided ritual player (SCR_RITUAL_001)
export { RitualIntro, type RitualIntroProps } from './components/RitualIntro';
export { RitualStep, type RitualStepProps } from './components/RitualStep';
export { ProgressRing, type ProgressRingProps } from './components/ProgressRing';
export { AudioControls, type AudioControlsProps } from './components/AudioControls';
export { CompletionMoment, type CompletionMomentProps } from './components/CompletionMoment';
// Calendar shell (SCR_CALENDAR_001)
export { MonthNav, type MonthNavProps } from './components/MonthNav';
export { MonthGrid, type MonthGridProps, type MonthGridDay } from './components/MonthGrid';
export { DayCell, type DayCellProps } from './components/DayCell';
export { TraditionSwitcher, type TraditionSwitcherProps, type TraditionOption } from './components/TraditionSwitcher';
// Ask Guru (SCR_GURU_*)
export { GuruHeader } from './components/GuruHeader';
export { ChatInput, type ChatInputProps } from './components/ChatInput';
export { AIChatBubble, type AIChatBubbleProps } from './components/AIChatBubble';
export { TypingIndicator } from './components/TypingIndicator';
export { SourceChip } from './components/SourceChip';
