import { Coupon, ICoupon } from '../models/coupon.model';

export class CouponRepository {
  public async findByCode(code: string): Promise<ICoupon | null> {
    return Coupon.findOne({ code: code.toUpperCase() }).exec();
  }

  public async findById(id: string): Promise<ICoupon | null> {
    return Coupon.findById(id).exec();
  }

  public async create(couponData: Partial<ICoupon>): Promise<ICoupon> {
    const coupon = new Coupon(couponData);
    return coupon.save();
  }

  public async update(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
    return Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  public async findAll(): Promise<ICoupon[]> {
    return Coupon.find({}).sort({ expiryDate: 1 }).exec();
  }

  public async delete(id: string): Promise<ICoupon | null> {
    return Coupon.findByIdAndDelete(id).exec();
  }
}

export const couponRepository = new CouponRepository();
export default couponRepository;
