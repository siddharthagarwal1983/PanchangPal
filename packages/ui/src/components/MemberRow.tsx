/**
 * MemberRow (CMP_MEMBER_ROW, PDD §5 / §5-household) — one household member: a decorative
 * initials avatar, the member's name, and a "{role} · {depth}" subtitle. The whole row carries
 * a single merged accessibility label (avatar is decorative, name is in the label). An optional
 * remove control is a separate ≥44 destructive button, shown only to the owner. Tokens-only.
 */
import { View, Pressable, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface MemberRowProps {
  /** Precomputed initials (1–2 chars); the avatar is decorative, so names live in the label. */
  initials: string;
  name: string;
  /** Localized "{role} · {depth}" subtitle, e.g. "Elder · Deep". */
  subtitle: string;
  /** When set, an owner-only remove button is shown with this accessible label. */
  onRemove?: () => void;
  removeLabel?: string;
  /** Marks the household owner (announced in the a11y label; no color-only meaning). */
  ownerBadgeLabel?: string;
  testID?: string;
}

export function MemberRow({ initials, name, subtitle, onRemove, removeLabel, ownerBadgeLabel, testID }: MemberRowProps) {
  const { theme } = useTheme();

  const avatar: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.chip,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const label = ownerBadgeLabel ? `${name}, ${ownerBadgeLabel}. ${subtitle}` : `${name}. ${subtitle}`;

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, minHeight: 44, paddingVertical: theme.spacing.sm }}
      testID={testID}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 }} accessible accessibilityLabel={label}>
        <View style={avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text variant="labelMedium" color="secondary">
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <Text variant="bodyLarge">{name}</Text>
            {ownerBadgeLabel ? (
              <View
                style={{
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: 2,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.brand.tonalBg,
                }}
              >
                <Text variant="labelSmall" color="brand">
                  {ownerBadgeLabel}
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="bodySmall" color="secondary">
            {subtitle}
          </Text>
        </View>
      </View>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={removeLabel ?? 'Remove'}
          hitSlop={8}
          style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.sm }}
        >
          <Text variant="labelMedium" color="danger">
            {removeLabel ?? 'Remove'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
</content>
