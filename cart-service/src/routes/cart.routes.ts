import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { protect } from '@shared/middlewares/auth.middleware';

const router = Router();

// Protect all cart routes
router.use(protect);

router.get('/', cartController.get.bind(cartController));
router.post('/', cartController.add.bind(cartController));
router.put('/:productId', cartController.update.bind(cartController));
router.delete('/:productId', cartController.remove.bind(cartController));
router.post('/apply-coupon', cartController.applyCoupon.bind(cartController));
router.post('/remove-coupon', cartController.removeCoupon.bind(cartController));

export default router;
