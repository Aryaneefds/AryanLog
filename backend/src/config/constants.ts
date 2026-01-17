export const CONSTANTS = {
    // Reading time calculation
    WORDS_PER_MINUTE: 200,

    // Pagination defaults
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,

    // Cache TTL (seconds)
    CACHE_TTL: {
        POST: 300,        // 5 minutes
        IDEA_GRAPH: 3600, // 1 hour
        SEARCH: 600,      // 10 minutes
    },

    // Content limits
    EXCERPT_LENGTH: 160,
    SLUG_MAX_LENGTH: 100,

    // Post statuses
    POST_STATUS: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        ARCHIVED: 'archived',
    } as const,

    // Thread statuses
    THREAD_STATUS: {
        ACTIVE: 'active',
        CONCLUDED: 'concluded',
        PAUSED: 'paused',
    } as const,

    // Thread node statuses
    NODE_STATUS: {
        FOUNDATIONAL: 'foundational',
        ACTIVE: 'active',
        SUPERSEDED: 'superseded',
        TANGENT: 'tangent',
    } as const,

    // Reference types
    REFERENCE_TYPE: {
        EXPLICIT: 'explicit',
        IMPLICIT: 'implicit',
    } as const,

    // Annotation types
    ANNOTATION_TYPE: {
        HIGHLIGHT: 'highlight',
        NOTE: 'note',
        MARGINALIA: 'marginalia',
    } as const,
} as const;

export type PostStatus = typeof CONSTANTS.POST_STATUS[keyof typeof CONSTANTS.POST_STATUS];
export type ThreadStatus = typeof CONSTANTS.THREAD_STATUS[keyof typeof CONSTANTS.THREAD_STATUS];
export type NodeStatus = typeof CONSTANTS.NODE_STATUS[keyof typeof CONSTANTS.NODE_STATUS];
export type ReferenceType = typeof CONSTANTS.REFERENCE_TYPE[keyof typeof CONSTANTS.REFERENCE_TYPE];
export type AnnotationType = typeof CONSTANTS.ANNOTATION_TYPE[keyof typeof CONSTANTS.ANNOTATION_TYPE];
