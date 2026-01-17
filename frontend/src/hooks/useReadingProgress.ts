import { useState, useEffect, useCallback } from 'react';

interface ReadingProgress {
    progress: number;       // 0-1
    currentSection: string; // Current heading
    isReading: boolean;     // User actively scrolling
}

export function useReadingProgress(contentRef: React.RefObject<HTMLElement | null>): ReadingProgress {
    const [progress, setProgress] = useState<ReadingProgress>({
        progress: 0,
        currentSection: '',
        isReading: false,
    });

    const calculateProgress = useCallback(() => {
        if (!contentRef.current) return;

        const element = contentRef.current;
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how much of the content has been scrolled past
        const scrolled = Math.max(0, -rect.top);
        const total = rect.height - windowHeight;
        const percentage = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;

        // Find current section
        const headings = element.querySelectorAll('h2, h3');
        let currentHeading = '';

        for (const heading of headings) {
            const headingRect = heading.getBoundingClientRect();
            if (headingRect.top < windowHeight * 0.3) {
                currentHeading = heading.textContent || '';
            }
        }

        setProgress(prev => ({
            ...prev,
            progress: percentage,
            currentSection: currentHeading,
        }));
    }, [contentRef]);

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            setProgress(prev => ({ ...prev, isReading: true }));
            calculateProgress();

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setProgress(prev => ({ ...prev, isReading: false }));
            }, 1000);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        calculateProgress(); // Initial calculation

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [calculateProgress]);

    return progress;
}
