import { Router } from 'express';
import blogRouter from './blog.routes';
import cmsRouter from './cms.routes';

const router = Router();

// Mount individual module routers
router.use('/blogs', blogRouter);
router.use('/cms', cmsRouter);

export default router;
