interface ReadingProgressProps {
    progress: number; // 0-1
}

export function ReadingProgress({ progress }: ReadingProgressProps) {
    return (
        <div
            className="reading-progress"
            style={{ width: `${progress * 100}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Reading progress"
        />
    );
}
