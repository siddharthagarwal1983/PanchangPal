/**
 * ConsequencesPanel (CMP_CONSEQUENCES_PANEL, PDD §5) — enumerates what account deletion will do,
 * before the destructive confirm (SCR_DELETE_ACCOUNT_001). Static + informational; the danger tone
 * is carried by the wording and a subtle danger surface (never color alone). Readable at max Dynamic
 * Type: each consequence is its own line item and the list is exposed to assistive tech as a group.
 * Tokens-only; the caller supplies already-localized, variant-appropriate copy.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface ConsequencesPanelProps {
  title: string;
  consequences: readonly string[];
  testID?: string;
}

export function ConsequencesPanel({ title, consequences, testID }: ConsequencesPanelProps) {
  const { theme } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${consequences.join('. ')}`}
      style={{
        backgroundColor: theme.colors.surface.dangerSubtle,
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
      testID={testID}
    >
      <Text variant="titleSmall" color="danger">
        {title}
      </Text>
      <View style={{ gap: theme.spacing.sm }}>
        {consequences.map((c, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Text variant="bodyLarge" color="secondary" accessibilityElementsHidden importantForAccessibility="no">
              {'•'}
            </Text>
            <Text variant="bodyLarge" color="primary" style={{ flex: 1 }}>
              {c}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
