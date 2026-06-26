import { Schema, model, Document } from 'mongoose';

export interface IWishlist extends Document {
  user: Schema.Types.ObjectId;
  products: any[]; // Will be populated in-memory as Product objects, or stored as ObjectIds
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Wishlist = model<IWishlist>('Wishlist', WishlistSchema);
export default Wishlist;
