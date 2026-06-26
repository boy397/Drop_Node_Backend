import { Schema, model, Document, Model } from 'mongoose';
import { Product } from './product.model';

export interface IReview extends Document {
  product: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  rating: number;
  comment: string;
}

interface IReviewModel extends Model<IReview> {
  calculateAverageRating(productId: Schema.Types.ObjectId): Promise<void>;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
ReviewSchema.statics.calculateAverageRating = async function (
  productId: Schema.Types.ObjectId
): Promise<void> {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      totalReviews: stats[0].nRating,
      averageRating: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      totalReviews: 0,
      averageRating: 0,
    });
  }
};

// Call calculateAverageRating after saving review
ReviewSchema.post<IReview>('save', function () {
  // 'this' points to the review document
  (this.constructor as IReviewModel).calculateAverageRating(this.product);
});

// Call calculateAverageRating after deleting review
ReviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await (doc.constructor as IReviewModel).calculateAverageRating(doc.product);
  }
});

export const Review = model<IReview, IReviewModel>('Review', ReviewSchema);
export default Review;
