/**
 * Subscription component tests (MOD_subscription, Milestone 8). Assert the trust/a11y-critical
 * behaviors: CMP_VALUE_LIST gives every row a text equivalent (never color-only), CMP_PLAN_CARD
 * exposes an accessible radio with name/price and reports selection (best value is TEXT, not color),
 * and CMP_LEGAL_FOOTNOTE renders labeled links. Prices are always passed in — never hardcoded.
 */
import { type ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme';
import { ValueList } from '../ValueList';
import { PlanCard } from '../PlanCard';
import { LegalFootnote } from '../LegalFootnote';

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const benefits = [
  { id: 'deep', label: 'Deep-dive content' },
  { id: 'guru', label: 'Extended answers' },
  { id: 'family', label: 'Share with household', included: false },
];

describe('CMP_VALUE_LIST', () => {
  it('gives included and excluded rows a screen-reader text equivalent (not color-only)', () => {
    wrap(<ValueList items={benefits} includedLabel="included" excludedLabel="not included" />);
    expect(screen.getByLabelText('Deep-dive content, included')).toBeTruthy();
    expect(screen.getByLabelText('Share with household, not included')).toBeTruthy();
  });
});

describe('CMP_PLAN_CARD', () => {
  it('exposes an accessible radio with name + price and reports selection', () => {
    const onSelect = jest.fn();
    wrap(
      <PlanCard
        id="individual_monthly"
        name="Individual"
        priceLabel="$4.99"
        periodLabel="per month"
        benefits={benefits}
        includedLabel="included"
        excludedLabel="not included"
        onSelect={onSelect}
        testID="plan-individual"
      />,
    );
    const card = screen.getByRole('radio', { name: 'Individual, $4.99 per month' });
    expect(card).toBeTruthy();
    fireEvent.press(card);
    expect(onSelect).toHaveBeenCalledWith('individual_monthly');
  });

  it('conveys best value as text in the accessible name (not color alone)', () => {
    wrap(
      <PlanCard
        id="family_yearly"
        name="Family"
        priceLabel="$39.99"
        periodLabel="per year"
        benefits={benefits}
        includedLabel="included"
        excludedLabel="not included"
        bestValueLabel="Best value"
        selected
        onSelect={() => {}}
        testID="plan-family"
      />,
    );
    // Best value is conveyed as TEXT in the accessible name (the badge itself is a11y-hidden to
    // avoid a duplicate announcement, so we assert the composed name, not the hidden badge node).
    expect(screen.getByRole('radio', { name: 'Family, Best value, $39.99 per year' })).toBeTruthy();
  });

  it('does not fire select while a purchase is in flight (loading)', () => {
    const onSelect = jest.fn();
    wrap(
      <PlanCard
        id="individual_monthly"
        name="Individual"
        priceLabel="$4.99"
        periodLabel="per month"
        benefits={benefits}
        includedLabel="included"
        excludedLabel="not included"
        loading
        onSelect={onSelect}
        testID="plan-loading"
      />,
    );
    fireEvent.press(screen.getByTestId('plan-loading'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('CMP_LEGAL_FOOTNOTE', () => {
  it('renders disclosure text and labeled legal links', () => {
    const onTerms = jest.fn();
    wrap(
      <LegalFootnote
        text="Subscriptions renew automatically until cancelled."
        links={[
          { id: 'terms', label: 'Terms of Service', onPress: onTerms },
          { id: 'privacy', label: 'Privacy Policy', onPress: () => {} },
        ]}
      />,
    );
    expect(screen.getByText('Subscriptions renew automatically until cancelled.')).toBeTruthy();
    fireEvent.press(screen.getByRole('link', { name: 'Terms of Service' }));
    expect(onTerms).toHaveBeenCalled();
  });
});
