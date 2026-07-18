/**
 * CMP_BOTTOM_SHEET tests (PDD §5.12). Assert the behaviors the sheet is trusted for: it is a
 * screen-reader modal labelled by its title, scrim/back dismiss it when dismissible, and a
 * `required-decision` sheet (dismissible={false}) ignores both so only a caller action closes it.
 * Reduced Motion fades in place instead of sliding (PDD §4).
 */
import { type ReactElement } from 'react';
import { Text as RNText } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme';
import { BottomSheet } from '../BottomSheet';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('CMP_BOTTOM_SHEET', () => {
  it('renders its title and content when visible', () => {
    wrap(
      <BottomSheet visible title="Go deeper" onDismiss={jest.fn()} testID="sheet">
        <RNText>Sheet body</RNText>
      </BottomSheet>,
    );
    expect(screen.getByText('Go deeper')).toBeTruthy();
    expect(screen.getByText('Sheet body')).toBeTruthy();
  });

  it('is an accessibility modal labelled by its title (SR focus is trapped inside)', () => {
    wrap(
      <BottomSheet visible title="Go deeper" onDismiss={jest.fn()} testID="sheet">
        <RNText>Sheet body</RNText>
      </BottomSheet>,
    );
    const surface = screen.getByTestId('sheet-surface');
    expect(surface.props.accessibilityViewIsModal).toBe(true);
    expect(surface.props.accessibilityLabel).toBe('Go deeper');
  });

  it('dismisses on scrim tap by default', () => {
    const onDismiss = jest.fn();
    wrap(
      <BottomSheet visible title="Go deeper" onDismiss={onDismiss} testID="sheet">
        <RNText>Sheet body</RNText>
      </BottomSheet>,
    );
    // The scrim is deliberately hidden from screen readers (the surface is the modal), so it is
    // excluded from the default query set — assert on it explicitly.
    fireEvent.press(screen.getByTestId('sheet-scrim', { includeHiddenElements: true }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('required-decision (dismissible=false) ignores scrim and back', () => {
    const onDismiss = jest.fn();
    wrap(
      <BottomSheet visible title="Confirm" dismissible={false} onDismiss={onDismiss} testID="sheet">
        <RNText>Sheet body</RNText>
      </BottomSheet>,
    );
    // The scrim is deliberately hidden from screen readers (the surface is the modal), so it is
    // excluded from the default query set — assert on it explicitly.
    fireEvent.press(screen.getByTestId('sheet-scrim', { includeHiddenElements: true }));
    fireEvent(screen.getByTestId('sheet'), 'requestClose');
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('fades in place under Reduced Motion instead of sliding', () => {
    wrap(
      <BottomSheet visible title="Go deeper" reduceMotion onDismiss={jest.fn()} testID="sheet">
        <RNText>Sheet body</RNText>
      </BottomSheet>,
    );
    expect(screen.getByTestId('sheet').props.animationType).toBe('fade');
  });
});
