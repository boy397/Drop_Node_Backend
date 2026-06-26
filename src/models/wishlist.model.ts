import { Schema, model, Document } from 'mongoose';

export interface IWishlist extends Document {
  user: Schema.Types.ObjectId;
  products: any[];
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Wishlist = model<IWishlist>('Wishlist', WishlistSchema);
export default Wishlist;
