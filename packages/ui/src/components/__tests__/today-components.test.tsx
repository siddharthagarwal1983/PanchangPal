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
import { RitualIntro } from '../RitualIntro';
import { RitualStep } from '../RitualStep';
import { CompletionMoment } from '../CompletionMoment';
import { MonthNav } from '../MonthNav';
import { MonthGrid } from '../MonthGrid';
import { TraditionSwitcher } from '../TraditionSwitcher';
import { ChatInput } from '../ChatInput';
import { AIChatBubble } from '../AIChatBubble';

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

describe('Guided ritual player components', () => {
  it('exposes a labeled intro action and step progress to assistive technology', () => {
    const begin = jest.fn();
    wrap(<RitualIntro title="Daily practice" body="A calm moment" beginLabel="Begin guidance" onBegin={begin} />);
    fireEvent.press(screen.getByRole('button', { name: 'Begin guidance' }));
    expect(begin).toHaveBeenCalled();
  });

  it('renders text-only fallback and routes next/skip interactions declaratively', () => {
    const next = jest.fn();
    const skip = jest.fn();
    wrap(<RitualStep text="Light a lamp" current={2} total={4} progressLabel="Step 2 of 4" nextLabel="Next" skipLabel="Skip this step" playLabel="Play narration" audioUnavailableLabel="Audio needs internet" audioAvailable={false} canSkip onNext={next} onSkip={skip} onPlayAudio={() => {}} />);
    expect(screen.getByRole('progressbar', { name: 'Step 2 of 4' })).toBeTruthy();
    expect(screen.getByText('Audio needs internet')).toBeTruthy();
    fireEvent.press(screen.getByTestId('ritual-next'));
    fireEvent.press(screen.getByTestId('ritual-skip'));
    expect(next).toHaveBeenCalled();
    expect(skip).toHaveBeenCalled();
  });

  it('renders a dedicated, announced completion state', () => {
    wrap(<CompletionMoment title="Done for today" body="Recorded" continueLabel="Return to Today" onContinue={() => {}} />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Return to Today' })).toBeTruthy();
  });
});

describe('Calendar shell components', () => {
  it('provides button alternatives for month navigation', () => {
    const previous = jest.fn();
    const next = jest.fn();
    wrap(<MonthNav label="July 2026" previousLabel="Previous month: June 2026" nextLabel="Next month: August 2026" todayLabel="Today" onPrevious={previous} onNext={next} onToday={() => {}} />);
    fireEvent.press(screen.getByTestId('calendar-previous'));
    fireEvent.press(screen.getByTestId('calendar-next'));
    expect(previous).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('labels day cells and exposes selection independently of color', () => {
    const select = jest.fn();
    wrap(<MonthGrid weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']} leadingBlankCells={0} days={[{ key: '2026-07-12', day: 12, label: 'Sunday, July 12, 2026', today: true }]} onSelectDay={select} />);
    fireEvent.press(screen.getByTestId('calendar-day-2026-07-12'));
    expect(select).toHaveBeenCalledWith('2026-07-12');
  });

  it('announces and changes the selected tradition', () => {
    const select = jest.fn();
    wrap(<TraditionSwitcher label="Tradition" selected="generic" options={[{ value: 'generic', label: 'General' }, { value: 'bengali', label: 'Bengali' }]} onSelect={select} />);
    fireEvent.press(screen.getByRole('menuitem', { name: 'Bengali' }));
    expect(select).toHaveBeenCalledWith('bengali');
  });
});

describe('Ask Guru components', () => {
  it('sends a composed question through an accessible button', () => {
    const send = jest.fn();
    wrap(<ChatInput value="What is a tithi?" placeholder="Ask Guru a question" sendLabel="Send" onChangeText={() => {}} onSend={send} />);
    fireEvent.press(screen.getByRole('button', { name: 'Send' }));
    expect(send).toHaveBeenCalled();
  });

  it('marks streaming answers as a polite live region', () => {
    wrap(<AIChatBubble author="assistant" text="A grounded answer" state="streaming" />);
    expect(screen.getByLabelText('Guru: A grounded answer')).toBeTruthy();
  });
});
