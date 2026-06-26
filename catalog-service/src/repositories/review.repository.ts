import { Review, IReview } from '../models/review.model';
import { FilterQuery } from 'mongoose';

export class ReviewRepository {
  public async findById(id: string): Promise<IReview | null> {
    return Review.findById(id).exec();
  }

  public async findAndCount(
    filter: FilterQuery<IReview>,
    skip = 0,
    limit = 5
  ): Promise<{ reviews: IReview[]; total: number }> {
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Review.countDocuments(filter).exec(),
    ]);

    return { reviews, total };
  }

  public async findByUserAndProduct(userId: string, productId: string): Promise<IReview | null> {
    return Review.findOne({ user: userId, product: productId }).exec();
  }

  public async create(reviewData: Partial<IReview>): Promise<IReview> {
    const review = new Review(reviewData);
    return review.save();
  }

  public async delete(id: string): Promise<IReview | null> {
    return Review.findByIdAndDelete(id).exec();
  }
}

export const reviewRepository = new ReviewRepository();
export default reviewRepository;
