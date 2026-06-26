import { Router } from 'express';
import { wishlistController } from '../controllers/wishlist.controller';
import { protect } from '@shared/middlewares/auth.middleware';

const router = Router();

// Protect all wishlist routes
router.use(protect);

router.get('/', wishlistController.get.bind(wishlistController));
router.post('/', wishlistController.add.bind(wishlistController));
router.delete('/:productId', wishlistController.remove.bind(wishlistController));
router.post('/:productId/move-to-cart', wishlistController.moveToCart.bind(wishlistController));

export default router;
