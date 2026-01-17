import { Router } from 'express';
import authRoutes from './auth.routes';
import postsRoutes from './posts.routes';
import ideasRoutes from './ideas.routes';
import threadsRoutes from './threads.routes';
import searchRoutes from './search.routes';
import readingRoutes from './reading.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/ideas', ideasRoutes);
router.use('/threads', threadsRoutes);
router.use('/search', searchRoutes);
router.use('/reading', readingRoutes);

export default router;
