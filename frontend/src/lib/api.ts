const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

class ApiError extends Error {
    constructor(public status: number, message: string, public details?: unknown) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = localStorage.getItem('auth_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new ApiError(response.status, error.error || 'Request failed', error.details);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

// Auth API
export const auth = {
    login: (email: string, password: string) =>
        request<{ token: string; user: User }>('/auth/login', {
            method: 'POST',
            body: { email, password },
        }),

    register: (email: string, password: string, name: string) =>
        request<{ token: string; user: User }>('/auth/register', {
            method: 'POST',
            body: { email, password, name },
        }),

    me: () => request<{ user: User }>('/auth/me'),

    updateProfile: (data: Partial<User>) =>
        request<{ user: User }>('/auth/me', { method: 'PATCH', body: data }),
};

// Posts API
export const posts = {
    list: (params?: { status?: string; idea?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        return request<{ posts: Post[]; pagination: Pagination }>(`/posts?${query}`);
    },

    get: (slug: string, options?: { includeBacklinks?: boolean }) => {
        const query = options?.includeBacklinks ? '?includeBacklinks=true' : '';
        return request<{ post: Post; ideas?: Idea[]; backlinks?: Backlink[]; threads?: ThreadSummary[] }>(
            `/posts/${slug}${query}`
        );
    },

    create: (data: CreatePostData) =>
        request<{ post: Post }>('/posts', { method: 'POST', body: data }),

    update: (id: string, data: UpdatePostData) =>
        request<{ post: Post; version: number }>(`/posts/${id}`, { method: 'PUT', body: data }),

    publish: (id: string, metadata?: PostMetadata) =>
        request<{ post: Post }>(`/posts/${id}/publish`, { method: 'POST', body: metadata }),

    archive: (id: string) =>
        request<{ post: Post }>(`/posts/${id}/archive`, { method: 'POST' }),

    delete: (id: string) =>
        request<void>(`/posts/${id}`, { method: 'DELETE' }),

    versions: (id: string) =>
        request<{ versions: PostVersion[] }>(`/posts/${id}/versions`),
};

// Ideas API
export const ideas = {
    list: () => request<{ ideas: Idea[] }>('/ideas'),

    get: (slug: string) =>
        request<{ idea: Idea; posts: PostSummary[]; relatedIdeas: RelatedIdea[] }>(`/ideas/${slug}`),

    graph: () => request<{ nodes: GraphNode[]; edges: GraphEdge[] }>('/ideas/graph'),

    create: (data: CreateIdeaData) =>
        request<{ idea: Idea }>('/ideas', { method: 'POST', body: data }),

    update: (id: string, data: UpdateIdeaData) =>
        request<{ idea: Idea }>(`/ideas/${id}`, { method: 'PATCH', body: data }),

    delete: (id: string) =>
        request<void>(`/ideas/${id}`, { method: 'DELETE' }),
};

// Threads API
export const threads = {
    list: () => request<{ threads: ThreadSummary[] }>('/threads'),

    get: (slug: string) =>
        request<{ thread: Thread; nodes: ThreadNode[] }>(`/threads/${slug}`),

    create: (data: CreateThreadData) =>
        request<{ thread: Thread }>('/threads', { method: 'POST', body: data }),

    update: (id: string, data: UpdateThreadData) =>
        request<{ thread: Thread }>(`/threads/${id}`, { method: 'PATCH', body: data }),

    addNode: (id: string, data: AddNodeData) =>
        request<{ thread: Thread }>(`/threads/${id}/nodes`, { method: 'POST', body: data }),

    updateNode: (id: string, order: number, data: UpdateNodeData) =>
        request<{ thread: Thread }>(`/threads/${id}/nodes/${order}`, { method: 'PATCH', body: data }),

    removeNode: (id: string, order: number) =>
        request<{ thread: Thread }>(`/threads/${id}/nodes/${order}`, { method: 'DELETE' }),

    delete: (id: string) =>
        request<void>(`/threads/${id}`, { method: 'DELETE' }),
};

// Search API
export const search = {
    query: (q: string, type: 'all' | 'posts' | 'ideas' | 'threads' = 'all') =>
        request<SearchResult>(`/search?q=${encodeURIComponent(q)}&type=${type}`),
};

// Reading API
export const reading = {
    track: (data: TrackingData) =>
        request<void>('/reading/track', { method: 'POST', body: data }),

    postStats: (id: string, days = 30) =>
        request<{ stats: PostStats }>(`/reading/posts/${id}?days=${days}`),

    siteStats: (days = 30) =>
        request<{ stats: SiteStats }>(`/reading/site?days=${days}`),
};

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    bio?: string;
    avatar?: string;
    socials?: { twitter?: string; github?: string };
}

export interface Post {
    _id: string;
    slug: string;
    title: string;
    subtitle?: string;
    content: string;
    excerpt?: string;
    status: 'draft' | 'published' | 'archived';
    publishedAt?: string;
    currentVersion: number;
    wordCount: number;
    readingTime: number;
    ideas: Idea[];
    metadata: PostMetadata;
    createdAt: string;
    updatedAt: string;
}

export interface PostMetadata {
    seoTitle?: string;
    seoDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
}

export interface PostVersion {
    _id: string;
    version: number;
    title: string;
    changeNote?: string;
    createdAt: string;
}

export interface PostSummary {
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    readingTime: number;
}

export interface Idea {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    postCount: number;
}

export interface RelatedIdea {
    name: string;
    slug: string;
    sharedPosts: number;
}

export interface Backlink {
    post: { title: string; slug: string; excerpt?: string };
    context: string;
    type: string;
}

export interface Thread {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    status: 'active' | 'concluded' | 'paused';
    visibility: 'public' | 'private';
    createdAt: string;
    updatedAt: string;
}

export interface ThreadSummary {
    title: string;
    slug: string;
    status?: string;
}

export interface ThreadNode {
    postId: string;
    order: number;
    status: 'foundational' | 'active' | 'superseded' | 'tangent';
    annotation: string;
    branchFrom: number | null;
    post?: {
        title: string;
        slug: string;
        publishedAt?: string;
        readingTime: number;
    };
}

export interface GraphNode {
    id: string;
    name: string;
    postCount: number;
}

export interface GraphEdge {
    source: string;
    target: string;
    weight: number;
}

export interface SearchResult {
    posts: Array<{ slug: string; title: string; excerpt: string; score: number }>;
    ideas: Array<{ slug: string; name: string; postCount: number }>;
    threads: Array<{ slug: string; title: string }>;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface TrackingData {
    postSlug: string;
    sessionId: string;
    scrollDepth: number;
    timeOnPage: number;
}

export interface PostStats {
    totalViews: number;
    totalUniqueVisitors: number;
    avgReadTime: number;
    avgCompletionRate: number;
    dailyStats: Array<{ date: string; views: number; uniqueVisitors: number }>;
}

export interface SiteStats {
    totalViews: number;
    totalUniqueVisitors: number;
    topPosts: Array<{ postId: string; views: number }>;
}

// Input types
export interface CreatePostData {
    title: string;
    content: string;
    subtitle?: string;
    excerpt?: string;
    ideas?: string[];
}

export interface UpdatePostData {
    title?: string;
    content?: string;
    subtitle?: string;
    excerpt?: string;
    ideas?: string[];
    changeNote?: string;
}

export interface CreateIdeaData {
    name: string;
    description?: string;
    relatedIdeas?: string[];
}

export interface UpdateIdeaData {
    name?: string;
    description?: string;
    relatedIdeas?: string[];
}

export interface CreateThreadData {
    title: string;
    description?: string;
    visibility?: 'public' | 'private';
}

export interface UpdateThreadData {
    title?: string;
    description?: string;
    status?: 'active' | 'concluded' | 'paused';
    visibility?: 'public' | 'private';
}

export interface AddNodeData {
    postId: string;
    status: 'foundational' | 'active' | 'superseded' | 'tangent';
    annotation: string;
    branchFrom?: number | null;
}

export interface UpdateNodeData {
    status?: 'foundational' | 'active' | 'superseded' | 'tangent';
    annotation?: string;
    branchFrom?: number | null;
}

export { ApiError };
