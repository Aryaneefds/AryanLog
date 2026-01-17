export const CONSTANTS = {
    // Site info
    SITE_NAME: 'Personal Thinking System',
    SITE_DESCRIPTION: 'A personal knowledge operating system',

    // Reading
    WORDS_PER_MINUTE: 200,

    // Pagination
    DEFAULT_PAGE_SIZE: 10,

    // Session
    SESSION_KEY: 'reading_session',

    // Theme
    THEME_KEY: 'theme_preference',

    // Keyboard shortcuts
    SHORTCUTS: {
        SEARCH: 'k', // Cmd/Ctrl + K
        THEME_TOGGLE: 't', // Cmd/Ctrl + T (when not in input)
    },
} as const;
