import { Schema, model, Document } from 'mongoose';

export interface ICartItem {
  product: any;
  quantity: number;
}

export interface ICartTotals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
}

export interface ICart extends Document {
  user: Schema.Types.ObjectId;
  items: ICartItem[];
  couponCode?: string | null;
  totals: ICartTotals;
}

const CartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
});

const CartTotalsSchema = new Schema<ICartTotals>({
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
});

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [CartItemSchema],
    couponCode: {
      type: String,
      default: null,
    },
    totals: {
      type: CartTotalsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = model<ICart>('Cart', CartSchema);
export default Cart;
