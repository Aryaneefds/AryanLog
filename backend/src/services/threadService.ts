import { Types } from 'mongoose';
import { ThoughtThread, IThoughtThread, IThreadNode, Post } from '../models/index';
import { generateSlug } from '../utils/index';
import { CONSTANTS, NodeStatus, ThreadStatus } from '../config/index';

export interface CreateThreadData {
    title: string;
    description?: string;
    visibility?: 'public' | 'private';
}

export interface AddNodeData {
    postId: string;
    status: NodeStatus;
    annotation: string;
    branchFrom?: number | null;
}

export interface ThreadWithPosts extends Omit<IThoughtThread, 'nodes'> {
    nodes: Array<IThreadNode & {
        post: {
            title: string;
            slug: string;
            publishedAt: Date | undefined;
            readingTime: number;
        } | null;
    }>;
}

/**
 * Create a new thought thread
 */
export async function createThread(data: CreateThreadData): Promise<IThoughtThread> {
    const slug = generateSlug(data.title);

    const existing = await ThoughtThread.findOne({ slug });
    if (existing) {
        throw Object.assign(new Error('A thread with this title already exists'), { statusCode: 409 });
    }

    const thread = new ThoughtThread({
        title: data.title,
        slug,
        description: data.description,
        visibility: data.visibility || 'public',
        nodes: [],
    });

    await thread.save();
    return thread;
}

/**
 * Add a node to a thread
 */
export async function addNodeToThread(threadId: string, data: AddNodeData): Promise<IThoughtThread> {
    const thread = await ThoughtThread.findById(threadId);
    if (!thread) {
        throw Object.assign(new Error('Thread not found'), { statusCode: 404 });
    }

    // Verify post exists
    const post = await Post.findById(data.postId);
    if (!post) {
        throw Object.assign(new Error('Post not found'), { statusCode: 404 });
    }

    // Calculate order (next available)
    const maxOrder = thread.nodes.reduce((max, node) => Math.max(max, node.order), -1);

    thread.nodes.push({
        postId: new Types.ObjectId(data.postId),
        order: maxOrder + 1,
        status: data.status,
        annotation: data.annotation,
        branchFrom: data.branchFrom ?? null,
    });

    await thread.save();
    return thread;
}

/**
 * Update a node in a thread
 */
export async function updateThreadNode(
    threadId: string,
    nodeOrder: number,
    updates: Partial<Pick<IThreadNode, 'status' | 'annotation' | 'branchFrom'>>
): Promise<IThoughtThread> {
    const thread = await ThoughtThread.findById(threadId);
    if (!thread) {
        throw Object.assign(new Error('Thread not found'), { statusCode: 404 });
    }

    const nodeIndex = thread.nodes.findIndex(n => n.order === nodeOrder);
    if (nodeIndex === -1) {
        throw Object.assign(new Error('Node not found in thread'), { statusCode: 404 });
    }

    if (updates.status) {
        thread.nodes[nodeIndex].status = updates.status;
    }
    if (updates.annotation !== undefined) {
        thread.nodes[nodeIndex].annotation = updates.annotation;
    }
    if (updates.branchFrom !== undefined) {
        thread.nodes[nodeIndex].branchFrom = updates.branchFrom;
    }

    await thread.save();
    return thread;
}

/**
 * Remove a node from a thread
 */
export async function removeNodeFromThread(threadId: string, nodeOrder: number): Promise<IThoughtThread> {
    const thread = await ThoughtThread.findById(threadId);
    if (!thread) {
        throw Object.assign(new Error('Thread not found'), { statusCode: 404 });
    }

    thread.nodes = thread.nodes.filter(n => n.order !== nodeOrder);
    await thread.save();
    return thread;
}

/**
 * Get thread by slug with populated posts
 */
export async function getThreadBySlug(slug: string): Promise<ThreadWithPosts | null> {
    const thread = await ThoughtThread.findOne({ slug, visibility: 'public' });
    if (!thread) return null;

    // Get all posts for this thread
    const postIds = thread.nodes.map(n => n.postId);
    const posts = await Post.find({
        _id: { $in: postIds },
        status: CONSTANTS.POST_STATUS.PUBLISHED,
    }).select('title slug publishedAt readingTime');

    const postMap = new Map(posts.map(p => [p._id.toString(), p]));

    const threadObj = thread.toObject();

    return {
        ...threadObj,
        nodes: thread.nodes.map(node => ({
            postId: node.postId,
            order: node.order,
            status: node.status,
            annotation: node.annotation,
            branchFrom: node.branchFrom,
            post: postMap.has(node.postId.toString())
                ? {
                    title: postMap.get(node.postId.toString())!.title,
                    slug: postMap.get(node.postId.toString())!.slug,
                    publishedAt: postMap.get(node.postId.toString())!.publishedAt,
                    readingTime: postMap.get(node.postId.toString())!.readingTime,
                }
                : null,
        })),
    } as unknown as ThreadWithPosts;
}

/**
 * List all public threads
 */
export async function listThreads(): Promise<IThoughtThread[]> {
    return ThoughtThread.find({ visibility: 'public' })
        .sort({ updatedAt: -1 })
        .select('-nodes');
}

/**
 * Get threads containing a post
 */
export async function getThreadsForPost(postId: string): Promise<Array<{
    title: string;
    slug: string;
    status: ThreadStatus;
}>> {
    const threads = await ThoughtThread.find({
        'nodes.postId': new Types.ObjectId(postId),
        visibility: 'public',
    }).select('title slug status');

    return threads.map(t => ({
        title: t.title,
        slug: t.slug,
        status: t.status,
    }));
}

/**
 * Update thread metadata
 */
export async function updateThread(
    threadId: string,
    data: Partial<Pick<IThoughtThread, 'title' | 'description' | 'status' | 'visibility'>>
): Promise<IThoughtThread> {
    const thread = await ThoughtThread.findById(threadId);
    if (!thread) {
        throw Object.assign(new Error('Thread not found'), { statusCode: 404 });
    }

    if (data.title) thread.title = data.title;
    if (data.description !== undefined) thread.description = data.description;
    if (data.status) thread.status = data.status;
    if (data.visibility) thread.visibility = data.visibility;

    await thread.save();
    return thread;
}

/**
 * Delete a thread
 */
export async function deleteThread(threadId: string): Promise<void> {
    const thread = await ThoughtThread.findById(threadId);
    if (!thread) {
        throw Object.assign(new Error('Thread not found'), { statusCode: 404 });
    }

    await thread.deleteOne();
}
