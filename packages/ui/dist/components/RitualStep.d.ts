export interface RitualStepProps {
    text: string;
    current: number;
    total: number;
    progressLabel: string;
    nextLabel: string;
    skipLabel: string;
    playLabel: string;
    audioUnavailableLabel: string;
    audioAvailable: boolean;
    canSkip: boolean;
    onNext: () => void;
    onSkip: () => void;
    onPlayAudio: () => void;
    testID?: string;
}
export declare function RitualStep({ text, current, total, progressLabel, nextLabel, skipLabel, playLabel, audioUnavailableLabel, audioAvailable, canSkip, onNext, onSkip, onPlayAudio, testID }: RitualStepProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=RitualStep.d.ts.map