/**
 * CMP_VALUE_LIST (PDD §5 — Value/Benefit List). A calm checkmark list of plan inclusions used by
 * CMP_PLAN_CARD and SCR_SUBSCRIPTION_001. Meaning is never color-only: every item carries a text
 * equivalent ("included" / "not included") so screen readers announce inclusion without relying on
 * the check glyph or its color (a11y, ADR-029). Static, tokens-only, no business logic.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface ValueListItem {
  /** Stable key + label of the benefit. */
  id: string;
  label: string;
  /** Excluded items render muted with a text equivalent; defaults to included. */
  included?: boolean;
}

export interface ValueListProps {
  items: ValueListItem[];
  /** Screen-reader text equivalent for an included row (e.g. "included"). */
  includedLabel: string;
  /** Screen-reader text equivalent for an excluded row (e.g. "not included"). */
  excludedLabel: string;
  testID?: string;
}

export function ValueList({ items, includedLabel, excludedLabel, testID }: ValueListProps) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }} testID={testID}>
      {items.map((item) => {
        const included = item.included !== false;
        const equivalent = included ? includedLabel : excludedLabel;
        return (
          <View
            key={item.id}
            accessibilityRole="text"
            accessibilityLabel={`${item.label}, ${equivalent}`}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}
            testID={`value-item-${item.id}`}
          >
            <Text
              variant="bodyMedium"
              color={included ? 'primary' : 'tertiary'}
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={{ color: included ? theme.colors.accent.positive : theme.colors.text.tertiary }}
            >
              {included ? '✓' : '—'}
            </Text>
            <Text
              variant="bodyMedium"
              color={included ? 'primary' : 'tertiary'}
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={{ flex: 1 }}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
