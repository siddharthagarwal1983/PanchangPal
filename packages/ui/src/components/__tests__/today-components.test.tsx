/**
 * Today component tests (PDD §5.13A.6). Assert the panchang card's unavailable vs data states,
 * the checklist checkbox role + optimistic toggle callback, and the ritual card's state-driven
 * action. These are the trust-critical states (panchang never fabricated; calm completion).
 */
import { type ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme';
import { PanchangCard } from '../PanchangCard';
import { Checklist } from '../Checklist';
import { RitualCard } from '../RitualCard';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('PanchangCard states', () => {
  it('shows the calm unavailable state (no fabricated values)', () => {
    wrap(<PanchangCard unavailable={{ message: 'Temporarily unavailable' }} />);
    expect(screen.getByText('Temporarily unavailable')).toBeTruthy();
  });
  it('renders panchang data when available', () => {
    wrap(
      <PanchangCard
        data={{ dateLabel: 'Sat, 12 Jul', city: 'Auckland', tithi: 'Dvitiya', nakshatra: 'Ashwini' }}
        onPress={() => {}}
      />,
    );
    expect(screen.getByText('Dvitiya')).toBeTruthy();
    expect(screen.getByText('Ashwini')).toBeTruthy();
  });
  it('shows a skeleton while loading', () => {
    wrap(<PanchangCard loading testID="pc" />);
    expect(screen.getByTestId('pc')).toBeTruthy();
  });
});

describe('Checklist', () => {
  it('exposes checkbox role with checked state and toggles optimistically', () => {
    const onToggle = jest.fn();
    wrap(
      <Checklist
        items={[
          { id: 'a', label: 'Light the lamp', complete: false },
          { id: 'b', label: 'Offer water', complete: true },
        ]}
        onToggle={onToggle}
      />,
    );
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(2);
    fireEvent.press(screen.getByTestId('checklist-item-a'));
    expect(onToggle).toHaveBeenCalledWith('a');
  });
});

describe('RitualCard', () => {
  it('shows a Begin action when not started', () => {
    wrap(
      <RitualCard title="Today's ritual" descriptor="d" durationLabel="5 min" state="not_started" actionLabel="Begin" stateAnnouncement="not started" onAction={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Begin' })).toBeTruthy();
  });
  it('shows a calm completed label (no button) when completed', () => {
    wrap(
      <RitualCard title="Today's ritual" descriptor="d" durationLabel="5 min" state="completed" actionLabel="Done for today" stateAnnouncement="completed" />,
    );
    expect(screen.getByText('Done for today')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Done for today' })).toBeNull();
  });
});
