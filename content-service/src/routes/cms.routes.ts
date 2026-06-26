import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';
import { protect, restrictTo } from '@shared/middlewares/auth.middleware';
import { UserRole } from '@shared/constants';

const router = Router();

// Public: Get single static page
router.get('/:slug', cmsController.getPage.bind(cmsController));

// Admin-only: Manage static pages
router.get(
  '/',
  protect,
  restrictTo(UserRole.ADMIN),
  cmsController.getAll.bind(cmsController)
);
router.post(
  '/',
  protect,
  restrictTo(UserRole.ADMIN),
  cmsController.create.bind(cmsController)
);
router.put(
  '/:slug',
  protect,
  restrictTo(UserRole.ADMIN),
  cmsController.update.bind(cmsController)
);
router.delete(
  '/:slug',
  protect,
  restrictTo(UserRole.ADMIN),
  cmsController.delete.bind(cmsController)
);

export default router;
