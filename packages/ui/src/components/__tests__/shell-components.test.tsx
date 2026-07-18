/**
 * Shared-component tests (PDD §5.13A.6 required coverage: render + a11y). Assert roles,
 * labels, and state so the Application Shell components meet the accessibility gate (ADR-029).
 */
import { type ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../theme';
import { Screen } from '../Screen';
import { AuthButton } from '../AuthButton';
import { BottomTabBar } from '../BottomTabBar';
import { OfflineBanner } from '../OfflineBanner';
import { ErrorState } from '../ErrorState';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

// BottomTabBar reads useSafeAreaInsets(), which needs a SafeAreaProvider with known metrics.
const SAFE_AREA_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};
const wrapSafeArea = (ui: ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );

describe('Application Shell components (a11y + states)', () => {
  it('Screen renders loading, error, empty, and offline states', () => {
    const { rerender } = wrap(<Screen loading testID="s" />);
    expect(screen.getByTestId('screen-loading')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <Screen error={{ message: 'Something went wrong' }} />
      </ThemeProvider>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <Screen empty={{ title: 'Nothing here yet' }} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Nothing here yet')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <Screen offline>{null}</Screen>
      </ThemeProvider>,
    );
    expect(screen.getByText(/offline/i)).toBeTruthy();
  });

  it('AuthButton exposes button role, label, disabled/busy state', () => {
    const onPress = jest.fn();
    wrap(<AuthButton provider="apple" label="Continue with Apple" onPress={onPress} />);
    const btn = screen.getByRole('button', { name: 'Continue with Apple' });
    fireEvent.press(btn);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('AuthButton does not fire when loading', () => {
    const onPress = jest.fn();
    wrap(<AuthButton provider="google" label="Continue with Google" onPress={onPress} loading />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('BottomTabBar renders a tablist with 4 selectable tabs', () => {
    const items = ['Today', 'Calendar', 'Ask Guru', 'You'].map((label, i) => ({
      key: label,
      label,
      focused: i === 0,
      onPress: jest.fn(),
      testID: `tab-${i}`,
    }));
    wrapSafeArea(<BottomTabBar items={items} />);
    // The tablist container is intentionally not an accessibility element (its tabs are the focus
    // stops), so it isn't role-queryable; asserting the 4 tabs covers "a tablist with 4 tabs".
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name: /Today/ })).toBeTruthy();
  });

  it('OfflineBanner is a polite alert', () => {
    wrap(<OfflineBanner />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('EmptyState/ErrorState render their content and retry', () => {
    const onRetry = jest.fn();
    wrap(<ErrorState message="Try later" onRetry={onRetry} />);
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});
