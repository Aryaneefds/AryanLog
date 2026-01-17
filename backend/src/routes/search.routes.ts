import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { searchService } from '../services/index';
import { validateQuery, searchLimiter, cacheResponse } from '../middleware/index';
import { CONSTANTS } from '../config/index';

const router = Router();

const searchQuerySchema = z.object({
    q: z.string().min(2).max(100),
    type: z.enum(['all', 'posts', 'ideas', 'threads']).default('all'),
});

router.get(
    '/',
    searchLimiter,
    validateQuery(searchQuerySchema),
    cacheResponse({ ttl: CONSTANTS.CACHE_TTL.SEARCH }),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { q, type } = req.query as { q: string; type: 'all' | 'posts' | 'ideas' | 'threads' };
            const results = await searchService.search(q, type);
            res.json(results);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
