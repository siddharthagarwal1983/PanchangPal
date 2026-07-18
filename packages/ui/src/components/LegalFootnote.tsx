/**
 * CMP_LEGAL_FOOTNOTE (PDD §5 — Legal Footnote). Terms / privacy / renewal disclosure shown on
 * SCR_AUTH_001 and SCR_SUBSCRIPTION_001. Links are labeled tap targets that open legal docs; the
 * disclosure text uses `text.tertiary` — the minimum token that still meets AA (never fainter).
 * Tokens-only, no business logic. The `subscription` variant carries the store renewal terms.
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface LegalLink {
  id: string;
  label: string;
  onPress: () => void;
}

export interface LegalFootnoteProps {
  /** Disclosure body (renewal terms for the subscription variant). */
  text: string;
  /** Labeled legal links (Terms, Privacy, …). */
  links?: LegalLink[];
  testID?: string;
}

export function LegalFootnote({ text, links = [], testID }: LegalFootnoteProps) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }} testID={testID}>
      <Text variant="bodySmall" color="tertiary">
        {text}
      </Text>
      {links.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
          {links.map((link) => (
            <Pressable
              key={link.id}
              onPress={link.onPress}
              accessibilityRole="link"
              accessibilityLabel={link.label}
              hitSlop={8}
              testID={`legal-link-${link.id}`}
            >
              <Text variant="bodySmall" color="brand">
                {link.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
