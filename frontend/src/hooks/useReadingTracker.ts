import { useEffect, useCallback, useRef } from 'react';
import { reading } from '../lib/api';
import { CONSTANTS } from '../lib/constants';

function getSessionId(): string {
    let sessionId = sessionStorage.getItem(CONSTANTS.SESSION_KEY);
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2);
        sessionStorage.setItem(CONSTANTS.SESSION_KEY, sessionId);
    }
    return sessionId;
}

export function useReadingTracker(postSlug: string | undefined) {
    const startTime = useRef(Date.now());
    const lastScrollDepth = useRef(0);

    const sendBeacon = useCallback(() => {
        if (!postSlug) return;

        const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);
        const scrollDepth = lastScrollDepth.current;

        // Use sendBeacon if available, otherwise use fetch
        const data = {
            postSlug,
            sessionId: getSessionId(),
            scrollDepth,
            timeOnPage,
        };

        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            navigator.sendBeacon('/api/reading/track', blob);
        } else {
            reading.track(data).catch(() => {
                // Ignore errors for tracking
            });
        }
    }, [postSlug]);

    useEffect(() => {
        if (!postSlug) return;

        startTime.current = Date.now();

        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const scrollDepth = (scrollTop + windowHeight) / documentHeight;
            lastScrollDepth.current = Math.min(1, scrollDepth);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial

        // Send beacon periodically
        const interval = setInterval(sendBeacon, 30000); // Every 30 seconds

        // Send beacon on page unload
        const handleUnload = () => sendBeacon();
        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                sendBeacon();
            }
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeunload', handleUnload);
            clearInterval(interval);
            sendBeacon(); // Final send
        };
    }, [postSlug, sendBeacon]);
}
