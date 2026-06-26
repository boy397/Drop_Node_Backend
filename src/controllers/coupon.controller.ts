import { Request, Response, NextFunction } from 'express';
import { couponRepository } from '../repositories/coupon.repository';
import { CouponDiscountType } from '../models/coupon.model';
import { z } from 'zod';

const createCouponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase().trim(),
  discountType: z.nativeEnum(CouponDiscountType),
  discountValue: z.coerce.number().positive('Discount value must be positive'),
  minOrderValue: z.coerce.number().nonnegative('Minimum order value cannot be negative').optional().default(0),
  expiryDate: z.string().datetime('Expiry date must be a valid ISO datetime string').transform((val) => new Date(val)),
  usageLimit: z.coerce.number().int().positive('Usage limit must be a positive integer'),
});

export class CouponController {
  // Get all coupons (Admin)
  public async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupons = await couponRepository.findAll();
      res.status(200).json({
        status: 'success',
        data: { coupons },
      });
    } catch (error) {
      next(error);
    }
  }

  // Create coupon (Admin)
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedBody = createCouponSchema.parse(req.body);
      const coupon = await couponRepository.create(validatedBody);

      res.status(201).json({
        status: 'success',
        message: 'Coupon created successfully',
        data: { coupon },
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete coupon (Admin)
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await couponRepository.delete(id);

      res.status(200).json({
        status: 'success',
        message: 'Coupon deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
export default couponController;
