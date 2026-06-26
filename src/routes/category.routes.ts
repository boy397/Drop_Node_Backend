import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../constants';

const router = Router();

// Public: Get hierarchical category tree for UI menus
router.get('/', categoryController.getTree.bind(categoryController));

// Admin-only: Create, Update, Delete categories
router.post(
  '/',
  protect,
  restrictTo(UserRole.ADMIN),
  categoryController.create.bind(categoryController)
);
router.put(
  '/:id',
  protect,
  restrictTo(UserRole.ADMIN),
  categoryController.update.bind(categoryController)
);
router.delete(
  '/:id',
  protect,
  restrictTo(UserRole.ADMIN),
  categoryController.delete.bind(categoryController)
);

export default router;
