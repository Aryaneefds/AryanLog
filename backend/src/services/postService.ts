import { Types } from 'mongoose';
import { Post, IPost } from '../models/index';
import { PostVersion } from '../models/index';
import { CONSTANTS } from '../config/index';
import { generateSlug, generateExcerpt } from '../utils/index';
import { extractAndSaveBacklinks } from './backlinkService';
import { updateIdeaPostCounts } from './ideaService';

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

export interface PostFilters {
    status?: string;
    idea?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

/**
 * Create a new draft post
 */
export async function createPost(data: CreatePostData): Promise<IPost> {
    const slug = generateSlug(data.title);

    // Check for duplicate slug
    const existing = await Post.findOne({ slug });
    if (existing) {
        throw Object.assign(new Error('A post with this title already exists'), { statusCode: 409 });
    }

    const post = new Post({
        title: data.title,
        content: data.content,
        slug,
        subtitle: data.subtitle,
        excerpt: data.excerpt || generateExcerpt(data.content),
        ideas: data.ideas?.map(id => new Types.ObjectId(id)) || [],
        status: CONSTANTS.POST_STATUS.DRAFT,
    });

    await post.save();

    // Update idea post counts
    if (post.ideas.length > 0) {
        await updateIdeaPostCounts(post.ideas.map(id => id.toString()));
    }

    return post;
}

/**
 * Update an existing post and create a version
 */
export async function updatePost(postId: string, data: UpdatePostData): Promise<IPost> {
    const post = await Post.findById(postId);
    if (!post) {
        throw Object.assign(new Error('Post not found'), { statusCode: 404 });
    }

    // Create version before updating
    await PostVersion.create({
        postId: post._id,
        version: post.currentVersion,
        title: post.title,
        content: post.content,
        changeNote: data.changeNote || 'Updated',
    });

    // Track old ideas for count update
    const oldIdeaIds = post.ideas.map(id => id.toString());

    // Update fields
    if (data.title) {
        post.title = data.title;
        // Don't update slug to avoid breaking links
    }
    if (data.content) {
        post.content = data.content;
        post.excerpt = data.excerpt || generateExcerpt(data.content);
    }
    if (data.subtitle !== undefined) {
        post.subtitle = data.subtitle;
    }
    if (data.ideas) {
        post.ideas = data.ideas.map(id => new Types.ObjectId(id));
    }

    post.currentVersion += 1;
    await post.save();

    // Update backlinks if content changed
    if (data.content && post.status === CONSTANTS.POST_STATUS.PUBLISHED) {
        await extractAndSaveBacklinks(post._id.toString(), post.content);
    }

    // Update idea post counts if ideas changed
    if (data.ideas) {
        const newIdeaIds = data.ideas;
        const allIdeaIds = [...new Set([...oldIdeaIds, ...newIdeaIds])];
        await updateIdeaPostCounts(allIdeaIds);
    }

    return post;
}

/**
 * Publish a draft post
 */
export async function publishPost(
    postId: string,
    metadata?: { seoTitle?: string; seoDescription?: string; ogImage?: string }
): Promise<IPost> {
    const post = await Post.findById(postId);
    if (!post) {
        throw Object.assign(new Error('Post not found'), { statusCode: 404 });
    }

    if (post.status === CONSTANTS.POST_STATUS.PUBLISHED) {
        throw Object.assign(new Error('Post is already published'), { statusCode: 400 });
    }

    post.status = CONSTANTS.POST_STATUS.PUBLISHED;
    post.publishedAt = new Date();

    if (metadata) {
        post.metadata = {
            ...post.metadata,
            ...metadata,
        };
    }

    await post.save();

    // Extract backlinks on publish
    await extractAndSaveBacklinks(post._id.toString(), post.content);

    return post;
}

/**
 * Archive a post
 */
export async function archivePost(postId: string): Promise<IPost> {
    const post = await Post.findById(postId);
    if (!post) {
        throw Object.assign(new Error('Post not found'), { statusCode: 404 });
    }

    post.status = CONSTANTS.POST_STATUS.ARCHIVED;
    await post.save();

    return post;
}

/**
 * Get a post by slug (public)
 */
export async function getPostBySlug(slug: string): Promise<IPost | null> {
    return Post.findOne({ slug, status: CONSTANTS.POST_STATUS.PUBLISHED })
        .populate('ideas', 'name slug');
}

/**
 * Get a post by ID (admin)
 */
export async function getPostById(postId: string): Promise<IPost | null> {
    if (!Types.ObjectId.isValid(postId)) {
        return null;
    }
    return Post.findById(postId).populate('ideas', 'name slug');
}

/**
 * List posts with filters
 */
export async function listPosts(filters: PostFilters = {}): Promise<{
    posts: IPost[];
    pagination: { page: number; limit: number; total: number; pages: number };
}> {
    const {
        status = CONSTANTS.POST_STATUS.PUBLISHED,
        idea,
        page = 1,
        limit = CONSTANTS.DEFAULT_PAGE_SIZE,
        sort = '-publishedAt',
    } = filters;

    const query: Record<string, unknown> = { status };

    if (idea) {
        const ideaDoc = await import('../models/index').then(m => m.Idea.findOne({ slug: idea }));
        if (ideaDoc) {
            query.ideas = ideaDoc._id;
        }
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
        .populate('ideas', 'name slug')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-content'); // Exclude full content for listing

    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}

/**
 * Get post versions
 */
export async function getPostVersions(postId: string): Promise<typeof PostVersion[]> {
    return PostVersion.find({ postId })
        .sort({ version: -1 })
        .select('version title changeNote createdAt');
}

/**
 * Get a specific version
 */
export async function getPostVersion(postId: string, version: number) {
    return PostVersion.findOne({ postId, version });
}

/**
 * Delete a post (admin only)
 */
export async function deletePost(postId: string): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) {
        throw Object.assign(new Error('Post not found'), { statusCode: 404 });
    }

    // Delete all versions
    await PostVersion.deleteMany({ postId });

    // Delete all references
    const Reference = (await import('../models/index')).Reference;
    await Reference.deleteMany({
        $or: [{ sourcePostId: postId }, { targetPostId: postId }],
    });

    // Update idea counts
    if (post.ideas.length > 0) {
        await updateIdeaPostCounts(post.ideas.map(id => id.toString()));
    }

    await post.deleteOne();
}
