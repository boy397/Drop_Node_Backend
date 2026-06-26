import { Cart, ICart } from '../models/cart.model';

export class CartRepository {
  // Find cart by user ID
  public async findByUserId(userId: string): Promise<ICart | null> {
    return Cart.findOne({ user: userId }).exec();
  }

  // Create or get empty cart for user
  public async getOrCreateCart(userId: string): Promise<ICart> {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totals: { subtotal: 0, discount: 0, tax: 0, shipping: 0, grandTotal: 0 },
      });
      await cart.save();
    }
    return cart;
  }

  // Save cart
  public async save(cart: ICart): Promise<ICart> {
    await cart.save();
    return cart;
  }
}

export const cartRepository = new CartRepository();
export default cartRepository;
