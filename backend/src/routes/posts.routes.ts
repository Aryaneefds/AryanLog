import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { postService, backlinkService, threadService } from '../services/index';
import { validateBody, validateQuery, authenticate, optionalAuth, cacheResponse, type AuthRequest } from '../middleware/index';
import { CONSTANTS } from '../config/index';

const router = Router();

// Validation schemas
const createPostSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    subtitle: z.string().max(300).optional(),
    excerpt: z.string().max(500).optional(),
    ideas: z.array(z.string()).optional(),
});

const updatePostSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    subtitle: z.string().max(300).optional(),
    excerpt: z.string().max(500).optional(),
    ideas: z.array(z.string()).optional(),
    changeNote: z.string().max(200).optional(),
});

const publishSchema = z.object({
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    ogImage: z.string().url().optional(),
});

const listQuerySchema = z.object({
    status: z.enum(['draft', 'published', 'archived']).optional(),
    idea: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    sort: z.string().default('-publishedAt'),
});

// Create draft
router.post(
    '/',
    authenticate,
    validateBody(createPostSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const post = await postService.createPost(req.body);
            res.status(201).json({ post });
        } catch (error) {
            next(error);
        }
    }
);

// Get post by slug (public)
router.get(
    '/:slug',
    optionalAuth,
    cacheResponse({ ttl: CONSTANTS.CACHE_TTL.POST }),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { slug } = req.params;
            const includeBacklinks = req.query.includeBacklinks === 'true';
            const includeIdeas = req.query.includeIdeas !== 'false';

            let post;

            // Admin can view any post
            if (req.userId) {
                post = await postService.getPostById(slug);
                if (!post) {
                    // Try by slug
                    post = await postService.getPostBySlug(slug);
                }
            } else {
                post = await postService.getPostBySlug(slug);
            }

            if (!post) {
                res.status(404).json({ error: 'Post not found' });
                return;
            }

            const response: Record<string, unknown> = { post };

            if (includeBacklinks) {
                response.backlinks = await backlinkService.getBacklinks(post._id.toString());
            }

            if (includeIdeas && post.ideas) {
                response.ideas = post.ideas;
            }

            // Get threads containing this post
            response.threads = await threadService.getThreadsForPost(post._id.toString());

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
);

// List posts
router.get(
    '/',
    optionalAuth,
    validateQuery(listQuerySchema),
    cacheResponse({ ttl: CONSTANTS.CACHE_TTL.POST }),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const filters = req.query as unknown as {
                status?: string;
                idea?: string;
                page: number;
                limit: number;
                sort: string;
            };

            // Only admin can see drafts
            if (filters.status !== CONSTANTS.POST_STATUS.PUBLISHED && !req.userId) {
                filters.status = CONSTANTS.POST_STATUS.PUBLISHED;
            }

            const result = await postService.listPosts(filters);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

// Update post
router.put(
    '/:id',
    authenticate,
    validateBody(updatePostSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const post = await postService.updatePost(id, req.body);
            res.json({ post, version: post.currentVersion });
        } catch (error) {
            next(error);
        }
    }
);

// Publish post
router.post(
    '/:id/publish',
    authenticate,
    validateBody(publishSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const post = await postService.publishPost(id, req.body);
            res.json({ post });
        } catch (error) {
            next(error);
        }
    }
);

// Archive post
router.post(
    '/:id/archive',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const post = await postService.archivePost(id);
            res.json({ post });
        } catch (error) {
            next(error);
        }
    }
);

// Get post versions
router.get(
    '/:id/versions',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const versions = await postService.getPostVersions(id);
            res.json({ versions });
        } catch (error) {
            next(error);
        }
    }
);

// Get specific version
router.get(
    '/:id/versions/:version',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, version } = req.params;
            const postVersion = await postService.getPostVersion(id, parseInt(version, 10));
            if (!postVersion) {
                res.status(404).json({ error: 'Version not found' });
                return;
            }
            res.json({ version: postVersion });
        } catch (error) {
            next(error);
        }
    }
);

// Delete post
router.delete(
    '/:id',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await postService.deletePost(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

export default router;
