import { Types } from 'mongoose';
import { Idea, IIdea, Post } from '../models/index';
import { generateSlug } from '../utils/index';
import { CONSTANTS } from '../config/index';

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

export interface IdeaGraphNode {
    id: string;
    name: string;
    postCount: number;
}

export interface IdeaGraphEdge {
    source: string;
    target: string;
    weight: number;
}

export interface IdeaGraph {
    nodes: IdeaGraphNode[];
    edges: IdeaGraphEdge[];
}

/**
 * Create a new idea
 */
export async function createIdea(data: CreateIdeaData): Promise<IIdea> {
    const slug = generateSlug(data.name);

    const existing = await Idea.findOne({ $or: [{ slug }, { name: data.name }] });
    if (existing) {
        throw Object.assign(new Error('An idea with this name already exists'), { statusCode: 409 });
    }

    const idea = new Idea({
        name: data.name,
        slug,
        description: data.description,
        relatedIdeas: data.relatedIdeas?.map(id => new Types.ObjectId(id)) || [],
    });

    await idea.save();
    return idea;
}

/**
 * Update an idea
 */
export async function updateIdea(ideaId: string, data: UpdateIdeaData): Promise<IIdea> {
    const idea = await Idea.findById(ideaId);
    if (!idea) {
        throw Object.assign(new Error('Idea not found'), { statusCode: 404 });
    }

    if (data.name) {
        idea.name = data.name;
        // Don't update slug to avoid breaking links
    }
    if (data.description !== undefined) {
        idea.description = data.description;
    }
    if (data.relatedIdeas) {
        idea.relatedIdeas = data.relatedIdeas.map(id => new Types.ObjectId(id));
    }

    await idea.save();
    return idea;
}

/**
 * Get an idea by slug with posts
 */
export async function getIdeaBySlug(slug: string): Promise<{
    idea: IIdea;
    posts: Array<{ title: string; slug: string; excerpt: string; publishedAt: Date; readingTime: number }>;
    relatedIdeas: Array<{ name: string; slug: string; sharedPosts: number }>;
} | null> {
    const idea = await Idea.findOne({ slug }).populate('relatedIdeas', 'name slug');
    if (!idea) return null;

    // Get all published posts with this idea
    const posts = await Post.find({
        ideas: idea._id,
        status: CONSTANTS.POST_STATUS.PUBLISHED,
    })
        .sort({ publishedAt: -1 })
        .select('title slug excerpt publishedAt readingTime');

    // Calculate shared posts for related ideas
    const populatedRelatedIdeas = idea.relatedIdeas as unknown as Array<{ name: string; slug: string; _id: Types.ObjectId }>;
    const relatedIdeas = await Promise.all(
        populatedRelatedIdeas.map(async (related) => {
            const sharedPosts = await Post.countDocuments({
                ideas: { $all: [idea._id, related._id] },
                status: CONSTANTS.POST_STATUS.PUBLISHED,
            });
            return {
                name: related.name,
                slug: related.slug,
                sharedPosts,
            };
        })
    );

    return {
        idea,
        posts: posts.map(p => ({
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt || '',
            publishedAt: p.publishedAt!,
            readingTime: p.readingTime,
        })),
        relatedIdeas,
    };
}

/**
 * Get all ideas
 */
export async function listIdeas(): Promise<IIdea[]> {
    return Idea.find().sort({ postCount: -1 });
}

/**
 * Build idea graph for visualization
 */
export async function getIdeaGraph(): Promise<IdeaGraph> {
    const ideas = await Idea.find().select('name slug postCount');

    const nodes: IdeaGraphNode[] = ideas.map(idea => ({
        id: idea.slug,
        name: idea.name,
        postCount: idea.postCount,
    }));

    // Calculate edges based on posts sharing ideas
    const edges: IdeaGraphEdge[] = [];
    const edgeMap = new Map<string, number>();

    // Get all published posts with their ideas
    const posts = await Post.find({ status: CONSTANTS.POST_STATUS.PUBLISHED })
        .select('ideas');

    for (const post of posts) {
        const postIdeas = post.ideas;
        // Create edges between all pairs of ideas in this post
        for (let i = 0; i < postIdeas.length; i++) {
            for (let j = i + 1; j < postIdeas.length; j++) {
                const idea1 = ideas.find(id => id._id.equals(postIdeas[i]));
                const idea2 = ideas.find(id => id._id.equals(postIdeas[j]));

                if (idea1 && idea2) {
                    const key = [idea1.slug, idea2.slug].sort().join('-');
                    edgeMap.set(key, (edgeMap.get(key) || 0) + 1);
                }
            }
        }
    }

    // Convert to edges array
    for (const [key, weight] of edgeMap) {
        const [source, target] = key.split('-');
        edges.push({ source, target, weight });
    }

    return { nodes, edges };
}

/**
 * Update post counts for ideas
 */
export async function updateIdeaPostCounts(ideaIds: string[]): Promise<void> {
    for (const ideaId of ideaIds) {
        const count = await Post.countDocuments({
            ideas: new Types.ObjectId(ideaId),
            status: CONSTANTS.POST_STATUS.PUBLISHED,
        });

        await Idea.findByIdAndUpdate(ideaId, { postCount: count });
    }
}

/**
 * Delete an idea
 */
export async function deleteIdea(ideaId: string): Promise<void> {
    const idea = await Idea.findById(ideaId);
    if (!idea) {
        throw Object.assign(new Error('Idea not found'), { statusCode: 404 });
    }

    // Remove idea from all posts
    await Post.updateMany(
        { ideas: idea._id },
        { $pull: { ideas: idea._id } }
    );

    // Remove from related ideas
    await Idea.updateMany(
        { relatedIdeas: idea._id },
        { $pull: { relatedIdeas: idea._id } }
    );

    await idea.deleteOne();
}
