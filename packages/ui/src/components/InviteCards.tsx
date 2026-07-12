/**
 * Invite cards (CMP_INVITE_LINK_CARD / CMP_INVITE_ACCEPT_CARD, PDD §5) for SCR_HOUSEHOLD_INVITE_001.
 *  - InviteLinkCard (inviter): shows the shareable link + expiry and a CMP_SHARE_BUTTON.
 *  - InviteAcceptCard (invitee): states the household + inviter clearly and offers a Join CTA;
 *    an expired token renders a calm, non-alarming expired state instead of the CTA.
 * Both are tokens-only and receive already-localized strings — no business logic here.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { ShareButton } from './ShareButton';

export interface InviteLinkCardProps {
  title: string;
  body: string;
  url: string;
  expiresLabel: string;
  shareMessage: string;
  shareLabel: string;
  testID?: string;
}

export function InviteLinkCard({ title, body, url, expiresLabel, shareMessage, shareLabel, testID }: InviteLinkCardProps) {
  const { theme } = useTheme();
  return (
    <Card testID={testID}>
      <View style={{ gap: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text variant="titleSmall">{title}</Text>
          <Text variant="bodyMedium" color="secondary">
            {body}
          </Text>
        </View>
        <View style={{ padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.muted }}>
          <Text variant="bodySmall" color="secondary" selectable accessibilityLabel={url}>
            {url}
          </Text>
        </View>
        <Text variant="labelSmall" color="secondary">
          {expiresLabel}
        </Text>
        <ShareButton message={shareMessage} url={url} label={shareLabel} testID={testID ? `${testID}-share` : undefined} />
      </View>
    </Card>
  );
}

export interface InviteAcceptCardProps {
  /** "{inviter} invited you to join {household}" is composed by the caller and passed in parts. */
  headline: string;
  detail: string;
  joinLabel: string;
  onJoin: () => void;
  loading?: boolean;
  expired?: boolean;
  expiredLabel?: string;
  testID?: string;
}

export function InviteAcceptCard({ headline, detail, joinLabel, onJoin, loading, expired, expiredLabel, testID }: InviteAcceptCardProps) {
  const { theme } = useTheme();
  return (
    <Card testID={testID}>
      <View style={{ gap: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text variant="titleSmall">{headline}</Text>
          <Text variant="bodyMedium" color="secondary">
            {detail}
          </Text>
        </View>
        {expired ? (
          <Text variant="bodyMedium" color="danger" accessibilityLiveRegion="polite">
            {expiredLabel}
          </Text>
        ) : (
          <PrimaryButton label={joinLabel} onPress={onJoin} loading={loading} testID={testID ? `${testID}-join` : undefined} />
        )}
      </View>
    </Card>
  );
}
</content>
