import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../constants';

const router = Router();

// Protect all coupon routes to Admin role only
router.use(protect);
router.use(restrictTo(UserRole.ADMIN));

router.get('/', couponController.getAll.bind(couponController));
router.post('/', couponController.create.bind(couponController));
router.delete('/:id', couponController.delete.bind(couponController));

export default router;
