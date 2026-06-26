import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller';
import { protect, restrictTo } from '@shared/middlewares/auth.middleware';
import { UserRole } from '@shared/constants';

const router = Router();

// Protect all coupon management routes to Admin only
router.use(protect);
router.use(restrictTo(UserRole.ADMIN));

router.get('/', couponController.getAll.bind(couponController));
router.post('/', couponController.create.bind(couponController));
router.delete('/:id', couponController.delete.bind(couponController));

export default router;
