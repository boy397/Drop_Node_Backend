import { wishlistRepository, WishlistRepository } from '../repositories/wishlist.repository';
import { productRepository } from '../repositories/product.repository';
import { cartService } from './cart.service';
import { IWishlist } from '../models/wishlist.model';
import { NotFoundError, BadRequestError } from '../errors/app-error';

export class WishlistService {
  private wishlistRepo: WishlistRepository;

  constructor(wishlistRepo = wishlistRepository) {
    this.wishlistRepo = wishlistRepo;
  }

  // Get user wishlist
  public async getWishlist(userId: string): Promise<IWishlist> {
    return this.wishlistRepo.getOrCreateWishlist(userId);
  }

  // Add product to wishlist
  public async addToWishlist(userId: string, productId: string): Promise<IWishlist> {
    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);
    const product = await productRepository.findById(productId);

    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found or inactive');
    }

    // Check if product is already in wishlist
    const exists = wishlist.products.some(
      (p) => p._id.toString() === productId
    );

    if (exists) {
      throw new BadRequestError('Product is already in your wishlist');
    }

    wishlist.products.push(product._id as any);
    return this.wishlistRepo.save(wishlist);
  }

  // Remove product from wishlist
  public async removeFromWishlist(userId: string, productId: string): Promise<IWishlist> {
    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);

    wishlist.products = wishlist.products.filter(
      (p) => p._id.toString() !== productId
    );

    return this.wishlistRepo.save(wishlist);
  }

  // Move product from wishlist to cart
  public async moveToCart(userId: string, productId: string): Promise<void> {
    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);

    const exists = wishlist.products.some(
      (p) => p._id.toString() === productId
    );

    if (!exists) {
      throw new NotFoundError('Product not found in wishlist');
    }

    // Add to cart first (will validate stock inside)
    await cartService.addToCart(userId, productId, 1);

    // Remove from wishlist
    wishlist.products = wishlist.products.filter(
      (p) => p._id.toString() !== productId
    );
    await this.wishlistRepo.save(wishlist);
  }
}

export const wishlistService = new WishlistService();
export default wishlistService;
