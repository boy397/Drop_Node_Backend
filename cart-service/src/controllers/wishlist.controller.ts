import { Request, Response, NextFunction } from 'express';
import { wishlistService } from '../services/wishlist.service';
import { z } from 'zod';

const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export class WishlistController {
  public async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.authUser!.id;
      const wishlist = await wishlistService.getWishlist(userId);
      res.status(200).json({
        status: 'success',
        data: { wishlist },
      });
    } catch (error) {
      next(error);
    }
  }

  public async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.authUser!.id;
      const { productId } = addToWishlistSchema.parse(req.body);
      const wishlist = await wishlistService.addToWishlist(userId, productId);

      res.status(200).json({
        status: 'success',
        message: 'Product added to wishlist',
        data: { wishlist },
      });
    } catch (error) {
      next(error);
    }
  }

  public async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.authUser!.id;
      const productId = req.params.productId;
      const wishlist = await wishlistService.removeFromWishlist(userId, productId);

      res.status(200).json({
        status: 'success',
        message: 'Product removed from wishlist',
        data: { wishlist },
      });
    } catch (error) {
      next(error);
    }
  }

  public async moveToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.authUser!.id;
      const productId = req.params.productId;
      
      await wishlistService.moveToCart(userId, productId);

      res.status(200).json({
        status: 'success',
        message: 'Product moved to cart successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const wishlistController = new WishlistController();
export default wishlistController;
