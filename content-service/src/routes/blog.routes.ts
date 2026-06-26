import { Router } from 'express';
import { blogController } from '../controllers/blog.controller';
import { protect, restrictTo } from '@shared/middlewares/auth.middleware';
import { UserRole } from '@shared/constants';

const router = Router();

// Public: View published blogs
router.get('/', blogController.getAll.bind(blogController));
router.get('/slug/:slug', blogController.getBySlug.bind(blogController));

// Admin-only: Create, Update, Delete blog posts
router.post(
  '/',
  protect,
  restrictTo(UserRole.ADMIN),
  blogController.create.bind(blogController)
);
router.put(
  '/:id',
  protect,
  restrictTo(UserRole.ADMIN),
  blogController.update.bind(blogController)
);
router.delete(
  '/:id',
  protect,
  restrictTo(UserRole.ADMIN),
  blogController.delete.bind(blogController)
);

export default router;
