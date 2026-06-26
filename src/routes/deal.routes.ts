import { Router } from 'express';
import { dealController } from '../controllers/deal.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../constants';

const router = Router();

// Public: Fetch active promotional deals
router.get('/active', dealController.getActive.bind(dealController));

// Admin-only: Schedule and manage deals
router.get(
  '/',
  protect,
  restrictTo(UserRole.ADMIN),
  dealController.getAll.bind(dealController)
);
router.post(
  '/',
  protect,
  restrictTo(UserRole.ADMIN),
  dealController.create.bind(dealController)
);
router.delete(
  '/:id',
  protect,
  restrictTo(UserRole.ADMIN),
  dealController.delete.bind(dealController)
);

export default router;
