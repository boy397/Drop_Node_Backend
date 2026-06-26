import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../constants';

const router = Router();

// Public: Fetch static page by slug (e.g., /api/cms/pages/about-us)
router.get('/pages/:slug', cmsController.getPage.bind(cmsController));

// Admin-only: Management endpoints
router.get(
  '/pages',
  protect,
  restrictTo(UserRole.ADMIN),
  cmsController.getAll.bind(cmsController)
);
router.post(
  '/pages',
  protect,
  restrictTo(UserRole.ADMIN),
  cmsController.create.bind(cmsController)
);
router.put(
  '/pages/:slug',
  protect,
  restrictTo(UserRole.ADMIN),
  cmsController.update.bind(cmsController)
);
router.delete(
  '/pages/:slug',
  protect,
  restrictTo(UserRole.ADMIN),
  cmsController.delete.bind(cmsController)
);

export default router;
