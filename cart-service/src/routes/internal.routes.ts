import { Router, Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { cartRepository } from '../repositories/cart.repository';

const router = Router();

// 1. Get user cart for checkout (Internal REST call)
router.get('/cart/:userId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;
  try {
    const cart = await cartService.getCart(userId);
    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
});

// 2. Clear user cart after successful checkout (Internal REST call)
router.post('/cart/:userId/clear', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;
  try {
    const cart = await cartRepository.getOrCreateCart(userId);
    cart.items = [];
    cart.couponCode = null;
    await cartService.recalculateTotals(cart);
    await cartRepository.save(cart);

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
