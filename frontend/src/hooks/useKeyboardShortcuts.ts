import { useEffect, useCallback } from 'react';

interface ShortcutHandler {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Ignore if typing in an input
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        for (const shortcut of shortcuts) {
            const metaOrCtrl = shortcut.metaKey || shortcut.ctrlKey;
            const isMetaPressed = event.metaKey || event.ctrlKey;

            if (
                event.key.toLowerCase() === shortcut.key.toLowerCase() &&
                (!metaOrCtrl || isMetaPressed)
            ) {
                event.preventDefault();
                shortcut.handler();
                return;
            }
        }
    }, [shortcuts]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
