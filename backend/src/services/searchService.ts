import { Post, Idea, ThoughtThread } from '../models/index';
import { CONSTANTS } from '../config/index';

export interface SearchResult {
    posts: Array<{
        slug: string;
        title: string;
        excerpt: string;
        score: number;
    }>;
    ideas: Array<{
        slug: string;
        name: string;
        postCount: number;
    }>;
    threads: Array<{
        slug: string;
        title: string;
    }>;
}

/**
 * Unified search across posts, ideas, and threads
 */
export async function search(query: string, type: 'all' | 'posts' | 'ideas' | 'threads' = 'all'): Promise<SearchResult> {
    const result: SearchResult = {
        posts: [],
        ideas: [],
        threads: [],
    };

    if (!query || query.trim().length < 2) {
        return result;
    }

    const searchTerm = query.trim();

    // Search posts
    if (type === 'all' || type === 'posts') {
        const posts = await Post.find(
            {
                $text: { $search: searchTerm },
                status: CONSTANTS.POST_STATUS.PUBLISHED,
            },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(10)
            .select('slug title excerpt');

        result.posts = posts.map(p => ({
            slug: p.slug,
            title: highlightMatch(p.title, searchTerm),
            excerpt: highlightMatch(p.excerpt || '', searchTerm),
            score: (p as unknown as { _doc: { score: number } })._doc?.score || 0,
        }));
    }

    // Search ideas
    if (type === 'all' || type === 'ideas') {
        const regex = new RegExp(escapeRegex(searchTerm), 'i');
        const ideas = await Idea.find({ name: regex })
            .sort({ postCount: -1 })
            .limit(5)
            .select('slug name postCount');

        result.ideas = ideas.map(i => ({
            slug: i.slug,
            name: i.name,
            postCount: i.postCount,
        }));
    }

    // Search threads
    if (type === 'all' || type === 'threads') {
        const regex = new RegExp(escapeRegex(searchTerm), 'i');
        const threads = await ThoughtThread.find({
            $or: [{ title: regex }, { description: regex }],
            visibility: 'public',
        })
            .limit(5)
            .select('slug title');

        result.threads = threads.map(t => ({
            slug: t.slug,
            title: t.title,
        }));
    }

    return result;
}

/**
 * Highlight search matches in text
 */
function highlightMatch(text: string, query: string): string {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
