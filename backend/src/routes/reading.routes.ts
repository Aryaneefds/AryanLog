import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { analyticsService } from '../services/index';
import { validateBody, trackingLimiter, authenticate } from '../middleware/index';

const router = Router();

const trackSchema = z.object({
    postSlug: z.string(),
    sessionId: z.string(),
    scrollDepth: z.number().min(0).max(1),
    timeOnPage: z.number().min(0),
});

// Track reading progress (beacon endpoint)
router.post(
    '/track',
    trackingLimiter,
    validateBody(trackSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await analyticsService.trackProgress(req.body);
            res.status(202).json({});
        } catch (error) {
            next(error);
        }
    }
);

// Get post stats (admin only)
router.get(
    '/posts/:id',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const days = parseInt(req.query.days as string, 10) || 30;
            const stats = await analyticsService.getPostStats(id, days);
            res.json({ stats });
        } catch (error) {
            next(error);
        }
    }
);

// Get site stats (admin only)
router.get(
    '/site',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const days = parseInt(req.query.days as string, 10) || 30;
            const stats = await analyticsService.getSiteStats(days);
            res.json({ stats });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
