import { Router } from 'express';
import { blogController } from '../controllers/blog.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../constants';

const router = Router();

// Public: Browse blog posts and read articles
router.get('/', blogController.getAll.bind(blogController));
router.get('/slug/:slug', blogController.getBySlug.bind(blogController));

// Admin/Writer: Manage articles
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
