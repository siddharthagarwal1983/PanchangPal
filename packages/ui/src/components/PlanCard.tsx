/**
 * CMP_PLAN_CARD (PDD §5 — Subscription Plan Card). Presents one plan (Individual/Family) with its
 * store-localized price + cadence and a CMP_VALUE_LIST of inclusions. The whole card is the select
 * control (≥44 target); the screen owns the purchase (native IAP via the PaymentAdapter) — this is
 * presentational only. "Best value" is conveyed as TEXT, never color alone (a11y). Prices are always
 * passed in from the store; the card never hardcodes a price. States: default / selected / loading.
 */
import { View, Pressable, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { ValueList, type ValueListItem } from './ValueList';

export interface PlanCardProps {
  /** Plan/offering id (passed back on select). */
  id: string;
  /** Localized plan name (e.g. "Individual", "Family"). */
  name: string;
  /** Store-localized price string (never hardcoded), e.g. "$4.99". */
  priceLabel: string;
  /** Localized cadence, e.g. "per month". */
  periodLabel: string;
  /** Inclusions rendered via CMP_VALUE_LIST. */
  benefits: ValueListItem[];
  includedLabel: string;
  excludedLabel: string;
  /** When set, shown as a text badge (e.g. "Best value") — text, not color. */
  bestValueLabel?: string;
  selected?: boolean;
  /** Disables selection while a purchase is in flight. */
  loading?: boolean;
  onSelect: (id: string) => void;
  testID?: string;
}

export function PlanCard({
  id,
  name,
  priceLabel,
  periodLabel,
  benefits,
  includedLabel,
  excludedLabel,
  bestValueLabel,
  selected = false,
  loading = false,
  onSelect,
  testID,
}: PlanCardProps) {
  const { theme } = useTheme();
  const style: ViewStyle = {
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radius.lg,
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? theme.colors.border.selected : theme.colors.border.subtle,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    opacity: loading ? 0.6 : 1,
  };
  // SR reads name → best-value → price → inclusions (PDD a11y), inclusions announced per-item.
  const a11yLabel = [name, bestValueLabel, `${priceLabel} ${periodLabel}`].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={() => onSelect(id)}
      disabled={loading}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: loading, busy: loading }}
      accessibilityLabel={a11yLabel}
      hitSlop={8}
      style={style}
      testID={testID}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <Text variant="titleLarge" color="primary" accessibilityElementsHidden importantForAccessibility="no">
          {name}
        </Text>
        {bestValueLabel ? (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              backgroundColor: theme.colors.brand.brandSubtle,
              borderRadius: theme.radius.sm,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
            }}
            testID={testID ? `${testID}-best-value` : undefined}
          >
            <Text variant="labelSmall" color="brand">
              {bestValueLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.xs }}>
        <Text variant="headingLarge" color="primary" accessibilityElementsHidden importantForAccessibility="no">
          {priceLabel}
        </Text>
        <Text variant="bodyMedium" color="secondary" accessibilityElementsHidden importantForAccessibility="no">
          {periodLabel}
        </Text>
      </View>

      <ValueList
        items={benefits}
        includedLabel={includedLabel}
        excludedLabel={excludedLabel}
        testID={testID ? `${testID}-values` : undefined}
      />
    </Pressable>
  );
}
