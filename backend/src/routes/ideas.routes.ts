import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ideaService } from '../services/index';
import { validateBody, authenticate, cacheResponse } from '../middleware/index';
import { CONSTANTS } from '../config/index';

const router = Router();

// Validation schemas
const createIdeaSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    relatedIdeas: z.array(z.string()).optional(),
});

const updateIdeaSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    relatedIdeas: z.array(z.string()).optional(),
});

// Get idea graph (public)
router.get(
    '/graph',
    cacheResponse({ ttl: CONSTANTS.CACHE_TTL.IDEA_GRAPH }),
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const graph = await ideaService.getIdeaGraph();
            res.json(graph);
        } catch (error) {
            next(error);
        }
    }
);

// List all ideas (public)
router.get(
    '/',
    cacheResponse({ ttl: CONSTANTS.CACHE_TTL.IDEA_GRAPH }),
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const ideas = await ideaService.listIdeas();
            res.json({ ideas });
        } catch (error) {
            next(error);
        }
    }
);

// Get idea by slug (public)
router.get(
    '/:slug',
    cacheResponse({ ttl: CONSTANTS.CACHE_TTL.POST }),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { slug } = req.params;
            const result = await ideaService.getIdeaBySlug(slug);

            if (!result) {
                res.status(404).json({ error: 'Idea not found' });
                return;
            }

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

// Create idea (admin)
router.post(
    '/',
    authenticate,
    validateBody(createIdeaSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const idea = await ideaService.createIdea(req.body);
            res.status(201).json({ idea });
        } catch (error) {
            next(error);
        }
    }
);

// Update idea (admin)
router.patch(
    '/:id',
    authenticate,
    validateBody(updateIdeaSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const idea = await ideaService.updateIdea(id, req.body);
            res.json({ idea });
        } catch (error) {
            next(error);
        }
    }
);

// Delete idea (admin)
router.delete(
    '/:id',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await ideaService.deleteIdea(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

export default router;
