/**
 * Ask Guru component tests (PDD §5.6/§5.10). Complements the shell test file's ChatInput/
 * AIChatBubble cases with the ConversationRow (history) and source-chip/typing a11y semantics.
 */
import { type ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme';
import { ConversationRow } from '../ConversationRow';
import { SourceChip } from '../SourceChip';
import { TypingIndicator } from '../TypingIndicator';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ConversationRow (history)', () => {
  it('is a labeled button announcing question, outcome, and time; reopens on press', () => {
    const onPress = jest.fn();
    wrap(<ConversationRow question="What is a tithi?" outcomeLabel="Answered with sources" timeLabel="Jul 12" onPress={onPress} testID="row" />);
    fireEvent.press(screen.getByTestId('row'));
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByLabelText('What is a tithi?. Answered with sources. Jul 12')).toBeTruthy();
  });
});

describe('SourceChip', () => {
  it('is a labeled source button', () => {
    const onPress = jest.fn();
    wrap(<SourceChip title="Reviewed source" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Source: Reviewed source' }));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('TypingIndicator', () => {
  it('renders the thinking label', () => {
    wrap(<TypingIndicator label="Guru is thinking." />);
    expect(screen.getByText('Guru is thinking.')).toBeTruthy();
  });
});
