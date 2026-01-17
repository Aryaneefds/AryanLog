import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { threadService } from '../services/index';
import { validateBody, authenticate, cacheResponse } from '../middleware/index';
import { CONSTANTS } from '../config/index';

const router = Router();

// Validation schemas
const createThreadSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    visibility: z.enum(['public', 'private']).optional(),
});

const addNodeSchema = z.object({
    postId: z.string(),
    status: z.enum(['foundational', 'active', 'superseded', 'tangent']),
    annotation: z.string().min(1).max(500),
    branchFrom: z.number().nullable().optional(),
});

const updateNodeSchema = z.object({
    status: z.enum(['foundational', 'active', 'superseded', 'tangent']).optional(),
    annotation: z.string().max(500).optional(),
    branchFrom: z.number().nullable().optional(),
});

const updateThreadSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['active', 'concluded', 'paused']).optional(),
    visibility: z.enum(['public', 'private']).optional(),
});

// List public threads
router.get(
    '/',
    cacheResponse({ ttl: CONSTANTS.CACHE_TTL.POST }),
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const threads = await threadService.listThreads();
            res.json({ threads });
        } catch (error) {
            next(error);
        }
    }
);

// Get thread by slug (public)
router.get(
    '/:slug',
    cacheResponse({ ttl: CONSTANTS.CACHE_TTL.POST }),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { slug } = req.params;
            const thread = await threadService.getThreadBySlug(slug);

            if (!thread) {
                res.status(404).json({ error: 'Thread not found' });
                return;
            }

            res.json({ thread: thread, nodes: thread.nodes });
        } catch (error) {
            next(error);
        }
    }
);

// Create thread (admin)
router.post(
    '/',
    authenticate,
    validateBody(createThreadSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const thread = await threadService.createThread(req.body);
            res.status(201).json({ thread });
        } catch (error) {
            next(error);
        }
    }
);

// Update thread (admin)
router.patch(
    '/:id',
    authenticate,
    validateBody(updateThreadSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const thread = await threadService.updateThread(id, req.body);
            res.json({ thread });
        } catch (error) {
            next(error);
        }
    }
);

// Add node to thread (admin)
router.post(
    '/:id/nodes',
    authenticate,
    validateBody(addNodeSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const thread = await threadService.addNodeToThread(id, req.body);
            res.status(201).json({ thread });
        } catch (error) {
            next(error);
        }
    }
);

// Update node in thread (admin)
router.patch(
    '/:id/nodes/:order',
    authenticate,
    validateBody(updateNodeSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, order } = req.params;
            const thread = await threadService.updateThreadNode(id, parseInt(order, 10), req.body);
            res.json({ thread });
        } catch (error) {
            next(error);
        }
    }
);

// Remove node from thread (admin)
router.delete(
    '/:id/nodes/:order',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, order } = req.params;
            const thread = await threadService.removeNodeFromThread(id, parseInt(order, 10));
            res.json({ thread });
        } catch (error) {
            next(error);
        }
    }
);

// Delete thread (admin)
router.delete(
    '/:id',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await threadService.deleteThread(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

export default router;
