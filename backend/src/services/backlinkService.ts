import { Reference, Post } from '../models/index';
import { extractInternalLinks } from '../utils/index';
import { CONSTANTS } from '../config/index';

export interface Backlink {
    post: {
        title: string;
        slug: string;
        excerpt?: string;
    };
    context: string;
    type: string;
}

/**
 * Extract internal links from content and save as references
 */
export async function extractAndSaveBacklinks(postId: string, content: string): Promise<void> {
    const links = extractInternalLinks(content);

    if (links.length === 0) {
        // Remove any existing references from this post
        await Reference.deleteMany({ sourcePostId: postId });
        return;
    }

    // Find target posts by slug
    const slugs = links.map(l => l.slug);
    const targetPosts = await Post.find({
        slug: { $in: slugs },
        status: CONSTANTS.POST_STATUS.PUBLISHED,
    }).select('_id slug');

    const slugToId = new Map(targetPosts.map(p => [p.slug, p._id.toString()]));

    // Remove existing references from this post
    await Reference.deleteMany({ sourcePostId: postId });

    // Create new references
    const references = links
        .filter(link => slugToId.has(link.slug))
        .map(link => ({
            sourcePostId: postId,
            targetPostId: slugToId.get(link.slug)!,
            type: CONSTANTS.REFERENCE_TYPE.EXPLICIT,
            context: link.context || '',
        }));

    if (references.length > 0) {
        await Reference.insertMany(references);
    }
}

/**
 * Get backlinks (posts that link to this post)
 */
export async function getBacklinks(postId: string): Promise<Backlink[]> {
    const refs = await Reference.find({ targetPostId: postId })
        .populate('sourcePostId', 'title slug excerpt')
        .sort({ createdAt: -1 });

    return refs.map(ref => ({
        post: {
            title: (ref.sourcePostId as unknown as { title: string }).title,
            slug: (ref.sourcePostId as unknown as { slug: string }).slug,
            excerpt: (ref.sourcePostId as unknown as { excerpt?: string }).excerpt,
        },
        context: ref.context || '',
        type: ref.type,
    }));
}

/**
 * Get outbound links (posts this post links to)
 */
export async function getOutboundLinks(postId: string): Promise<Array<{
    post: { title: string; slug: string };
    context: string;
}>> {
    const refs = await Reference.find({ sourcePostId: postId })
        .populate('targetPostId', 'title slug')
        .sort({ createdAt: -1 });

    return refs.map(ref => ({
        post: {
            title: (ref.targetPostId as unknown as { title: string }).title,
            slug: (ref.targetPostId as unknown as { slug: string }).slug,
        },
        context: ref.context || '',
    }));
}

/**
 * Rebuild all backlinks (maintenance task)
 */
export async function rebuildAllBacklinks(): Promise<{ processed: number; references: number }> {
    const posts = await Post.find({ status: CONSTANTS.POST_STATUS.PUBLISHED })
        .select('_id content');

    let totalReferences = 0;

    for (const post of posts) {
        await extractAndSaveBacklinks(post._id.toString(), post.content);
        const count = await Reference.countDocuments({ sourcePostId: post._id });
        totalReferences += count;
    }

    return { processed: posts.length, references: totalReferences };
}
