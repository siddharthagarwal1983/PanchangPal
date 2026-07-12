import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export function InviteLinkCard({ title, body, url, expiresLabel, shareMessage, shareLabel, testID }) {
    const { theme } = useTheme();
    return (_jsx(Card, { testID: testID, children: _jsxs(View, { style: { gap: theme.spacing.md }, children: [_jsxs(View, { style: { gap: theme.spacing.xs }, children: [_jsx(Text, { variant: "titleSmall", children: title }), _jsx(Text, { variant: "bodyMedium", color: "secondary", children: body })] }), _jsx(View, { style: { padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.muted }, children: _jsx(Text, { variant: "bodySmall", color: "secondary", selectable: true, accessibilityLabel: url, children: url }) }), _jsx(Text, { variant: "labelSmall", color: "secondary", children: expiresLabel }), _jsx(ShareButton, { message: shareMessage, url: url, label: shareLabel, testID: testID ? `${testID}-share` : undefined })] }) }));
}
export function InviteAcceptCard({ headline, detail, joinLabel, onJoin, loading, expired, expiredLabel, testID }) {
    const { theme } = useTheme();
    return (_jsx(Card, { testID: testID, children: _jsxs(View, { style: { gap: theme.spacing.md }, children: [_jsxs(View, { style: { gap: theme.spacing.xs }, children: [_jsx(Text, { variant: "titleSmall", children: headline }), _jsx(Text, { variant: "bodyMedium", color: "secondary", children: detail })] }), expired ? (_jsx(Text, { variant: "bodyMedium", color: "danger", accessibilityLiveRegion: "polite", children: expiredLabel })) : (_jsx(PrimaryButton, { label: joinLabel, onPress: onJoin, loading: loading, testID: testID ? `${testID}-join` : undefined }))] }) }));
}
//# sourceMappingURL=InviteCards.js.map