import { Deal, IDeal } from '../models/deal.model';

export class DealRepository {
  public async findById(id: string): Promise<IDeal | null> {
    return Deal.findById(id).populate('products', 'name price slug images').exec();
  }

  public async create(dealData: Partial<IDeal>): Promise<IDeal> {
    const deal = new Deal(dealData);
    return deal.save();
  }

  public async update(id: string, updateData: Partial<IDeal>): Promise<IDeal | null> {
    return Deal.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('products', 'name price slug images').exec();
  }

  public async delete(id: string): Promise<IDeal | null> {
    return Deal.findByIdAndDelete(id).exec();
  }

  public async findActiveDeals(): Promise<IDeal[]> {
    const now = new Date();
    return Deal.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    })
      .populate('products', 'name price slug images compareAtPrice stock')
      .exec();
  }

  public async findAll(): Promise<IDeal[]> {
    return Deal.find({}).sort({ startTime: -1 }).populate('products', 'name price slug').exec();
  }
}

export const dealRepository = new DealRepository();
export default dealRepository;
