import { Router, Request, Response, NextFunction } from 'express';
import { productRepository } from '../repositories/product.repository';
import { Product } from '../models/product.model';

const router = Router();

// 1. Reserve stock for order checkout (Internal REST call)
router.post('/products/reserve-stock', async (req: Request, res: Response): Promise<void> => {
  const { items } = req.body as { items: Array<{ productId: string; quantity: number }> };

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ status: 'error', message: 'Items list is required for reservation.' });
    return;
  }

  const reservedItems: Array<{ productId: string; quantity: number }> = [];
  try {
    for (const item of items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Out of stock: Product "${product.name}" only has ${product.stock} units available, but ${item.quantity} were requested.`);
      }

      // Atomically deduct stock
      const updated = await productRepository.adjustStock(item.productId, -item.quantity);
      if (!updated || updated.stock < 0) {
        // Rollback this item's deduction immediately if stock somehow dipped negative (double check)
        if (updated) {
          await productRepository.adjustStock(item.productId, item.quantity);
        }
        throw new Error(`Out of stock (race condition): Product "${product.name}"`);
      }

      reservedItems.push(item);
    }

    res.status(200).json({
      status: 'success',
      message: 'All items reserved successfully',
    });
  } catch (error: any) {
    // Compensating Action: Rollback all previously reserved items in this request
    console.warn(`⚠️ Stock reservation failed. Initiating rollback for:`, reservedItems);
    for (const reserved of reservedItems) {
      await productRepository.adjustStock(reserved.productId, reserved.quantity);
    }
    
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to reserve stock',
    });
  }
});

// 2. Release stock for cancelled orders/failed checkouts (Internal REST call)
router.post('/products/release-stock', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { items } = req.body as { items: Array<{ productId: string; quantity: number }> };

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ status: 'error', message: 'Items list is required for releasing stock.' });
    return;
  }

  try {
    for (const item of items) {
      await productRepository.adjustStock(item.productId, item.quantity);
    }

    res.status(200).json({
      status: 'success',
      message: 'Stock released successfully',
    });
  } catch (error: any) {
    next(error);
  }
});

// 3. Bulk fetch product details by IDs (Internal REST call)
router.post('/products/bulk', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { productIds } = req.body as { productIds: string[] };

  if (!productIds || !Array.isArray(productIds)) {
    res.status(400).json({ status: 'error', message: 'productIds array is required' });
    return;
  }

  try {
    const products = await Product.find({ _id: { $in: productIds } }).populate('category', 'name slug').exec();
    res.status(200).json({
      status: 'success',
      data: { products },
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
