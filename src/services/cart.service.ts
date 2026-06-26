import { cartRepository, CartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { couponRepository } from '../repositories/coupon.repository';
import { ICart } from '../models/cart.model';
import { BadRequestError, NotFoundError } from '../errors/app-error';
import { CouponDiscountType } from '../models/coupon.model';

export class CartService {
  private cartRepo: CartRepository;

  constructor(cartRepo = cartRepository) {
    this.cartRepo = cartRepo;
  }

  // Get user cart
  public async getCart(userId: string): Promise<ICart> {
    return this.cartRepo.getOrCreateCart(userId);
  }

  // Add item to cart
  public async addToCart(userId: string, productId: string, quantity = 1): Promise<ICart> {
    const cart = await this.cartRepo.getOrCreateCart(userId);
    const product = await productRepository.findById(productId);

    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found or inactive');
    }

    if (product.stock < quantity) {
      throw new BadRequestError(`Insufficient stock. Only ${product.stock} units available.`);
    }

    // Check if product is already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestError(`Insufficient stock. Cannot add more of this item. Max available is ${product.stock}.`);
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({ product: product._id as any, quantity });
    }

    await this.recalculateTotals(cart);
    return this.cartRepo.save(cart);
  }

  // Update cart item quantity
  public async updateQuantity(userId: string, productId: string, quantity: number): Promise<ICart> {
    if (quantity < 1) {
      return this.removeFromCart(userId, productId);
    }

    const cart = await this.cartRepo.getOrCreateCart(userId);
    const product = await productRepository.findById(productId);

    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found or inactive');
    }

    if (product.stock < quantity) {
      throw new BadRequestError(`Insufficient stock. Only ${product.stock} units available.`);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Product not found in cart');
    }

    cart.items[itemIndex].quantity = quantity;

    await this.recalculateTotals(cart);
    return this.cartRepo.save(cart);
  }

  // Remove item from cart
  public async removeFromCart(userId: string, productId: string): Promise<ICart> {
    const cart = await this.cartRepo.getOrCreateCart(userId);

    cart.items = cart.items.filter(
      (item) => item.product._id.toString() !== productId
    );

    await this.recalculateTotals(cart);
    return this.cartRepo.save(cart);
  }

  // Apply coupon code
  public async applyCoupon(userId: string, code: string): Promise<ICart> {
    const cart = await this.cartRepo.getOrCreateCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestError('Cannot apply coupon to an empty cart');
    }

    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
      throw new NotFoundError('Coupon code is invalid');
    }

    // Calculate temporary subtotal to validate coupon
    let tempSubtotal = 0;
    cart.items.forEach((item: any) => {
      if (item.product) {
        tempSubtotal += item.product.price * item.quantity;
      }
    });

    if (!coupon.isValid(tempSubtotal)) {
      throw new BadRequestError('Coupon is expired, fully used, or minimum order value not met');
    }

    cart.couponCode = coupon.code;
    await this.recalculateTotals(cart);
    return this.cartRepo.save(cart);
  }

  // Remove coupon code
  public async removeCoupon(userId: string): Promise<ICart> {
    const cart = await this.cartRepo.getOrCreateCart(userId);
    cart.couponCode = null;
    await this.recalculateTotals(cart);
    return this.cartRepo.save(cart);
  }

  // Recalculate all cart totals
  public async recalculateTotals(cart: ICart): Promise<void> {
    let subtotal = 0;

    // 1. Calculate Subtotal
    cart.items.forEach((item: any) => {
      if (item.product) {
        subtotal += item.product.price * item.quantity;
      }
    });

    let discount = 0;

    // 2. Calculate Coupon Discount if applied
    if (cart.couponCode) {
      const coupon = await couponRepository.findByCode(cart.couponCode);
      if (coupon && coupon.isValid(subtotal)) {
        if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
          discount = subtotal * (coupon.discountValue / 100);
        } else {
          discount = coupon.discountValue;
        }
        // Discount cannot exceed subtotal
        discount = Math.min(discount, subtotal);
      } else {
        // Invalid coupon, remove it automatically
        cart.couponCode = null;
      }
    }

    // 3. Calculate Shipping
    // Free shipping for orders over $100 after discount, else flat $10. 
    // If cart is empty, shipping is 0.
    const netAmount = subtotal - discount;
    const shipping = cart.items.length === 0 ? 0 : netAmount >= 100 ? 0 : 10;

    // 4. Calculate Tax (10% of net amount)
    const tax = Math.round(netAmount * 0.1 * 100) / 100;

    // 5. Calculate Grand Total
    const grandTotal = Math.round((netAmount + tax + shipping) * 100) / 100;

    cart.totals = {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      tax,
      shipping,
      grandTotal,
    };
  }
}

export const cartService = new CartService();
export default cartService;
