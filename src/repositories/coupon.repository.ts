import { Coupon, ICoupon } from '../models/coupon.model';

export class CouponRepository {
  // Find coupon by code
  public async findByCode(code: string): Promise<ICoupon | null> {
    return Coupon.findOne({ code: code.toUpperCase() }).exec();
  }

  // Find coupon by ID
  public async findById(id: string): Promise<ICoupon | null> {
    return Coupon.findById(id).exec();
  }

  // Create a coupon
  public async create(couponData: Partial<ICoupon>): Promise<ICoupon> {
    const coupon = new Coupon(couponData);
    return coupon.save();
  }

  // Update a coupon
  public async update(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
    return Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  // Find all coupons
  public async findAll(): Promise<ICoupon[]> {
    return Coupon.find({}).sort({ expiryDate: 1 }).exec();
  }

  // Delete a coupon
  public async delete(id: string): Promise<ICoupon | null> {
    return Coupon.findByIdAndDelete(id).exec();
  }
}

export const couponRepository = new CouponRepository();
export default couponRepository;
