import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { protect, restrictTo } from '@shared/middlewares/auth.middleware';
import { UserRole } from '@shared/constants';

const router = Router();

// Protect all order routes
router.use(protect);

// Customer endpoints
router.post('/checkout', orderController.checkout.bind(orderController));
router.get('/history', orderController.getHistory.bind(orderController));
router.get('/:id', orderController.getDetails.bind(orderController));
router.put('/:id/cancel', orderController.cancel.bind(orderController));

// Admin & Vendor endpoints
router.get(
  '/',
  restrictTo(UserRole.ADMIN, UserRole.VENDOR),
  orderController.adminGetAll.bind(orderController)
);
router.put(
  '/:id/status',
  restrictTo(UserRole.ADMIN, UserRole.VENDOR),
  orderController.adminUpdateStatus.bind(orderController)
);

export default router;
