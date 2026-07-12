export interface InviteLinkCardProps {
    title: string;
    body: string;
    url: string;
    expiresLabel: string;
    shareMessage: string;
    shareLabel: string;
    testID?: string;
}
export declare function InviteLinkCard({ title, body, url, expiresLabel, shareMessage, shareLabel, testID }: InviteLinkCardProps): import("react/jsx-runtime").JSX.Element;
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
export declare function InviteAcceptCard({ headline, detail, joinLabel, onJoin, loading, expired, expiredLabel, testID }: InviteAcceptCardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=InviteCards.d.ts.map