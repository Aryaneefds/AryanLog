import { useState, useEffect } from 'react';
import { CONSTANTS } from '../lib/constants';

type Theme = 'dark' | 'light';

export function useDarkMode(): [Theme, () => void] {
    const [theme, setTheme] = useState<Theme>(() => {
        // Check localStorage first
        const stored = localStorage.getItem(CONSTANTS.THEME_KEY);
        if (stored === 'light' || stored === 'dark') {
            return stored;
        }
        // Default to dark (as per spec: dark mode first)
        return 'dark';
    });

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(CONSTANTS.THEME_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return [theme, toggleTheme];
}
