export interface AudioControlsProps {
    available: boolean;
    playLabel: string;
    unavailableLabel: string;
    onPlay: () => void;
    testID?: string;
}
/** Declarative control; playback itself is supplied through the feature's AudioAdapter. */
export declare function AudioControls({ available, playLabel, unavailableLabel, onPlay, testID }: AudioControlsProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AudioControls.d.ts.map