export type InfoBannerTone = 'info' | 'offline' | 'warning';
export interface InfoBannerProps {
    message: string;
    tone?: InfoBannerTone;
    testID?: string;
}
export declare function InfoBanner({ message, tone, testID }: InfoBannerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=InfoBanner.d.ts.map