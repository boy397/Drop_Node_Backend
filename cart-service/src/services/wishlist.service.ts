import { wishlistRepository, WishlistRepository } from '../repositories/wishlist.repository';
import { catalogClient, ICatalogProduct } from '../utils/catalog-client';
import { cartService } from './cart.service';
import { IWishlist } from '../models/wishlist.model';
import { NotFoundError, BadRequestError } from '@shared/errors/app-error';
import { logger } from '@shared/utils/logger';

export class WishlistService {
  private wishlistRepo: WishlistRepository;

  constructor(wishlistRepo = wishlistRepository) {
    this.wishlistRepo = wishlistRepo;
  }

  // Get user wishlist and populate product details in-memory
  public async getWishlist(userId: string): Promise<any> {
    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);
    return this.populateWishlistProducts(wishlist);
  }

  // Add product to wishlist
  public async addToWishlist(userId: string, productId: string): Promise<any> {
    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);
    
    // Verify product exists and is active in Catalog
    const product = await catalogClient.getProductById(productId);
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found or inactive');
    }

    // Check if product is already in wishlist
    const exists = wishlist.products.some(
      (p) => p.toString() === productId
    );

    if (exists) {
      throw new BadRequestError('Product is already in your wishlist');
    }

    wishlist.products.push(productId as any);
    const saved = await this.wishlistRepo.save(wishlist);
    return this.populateWishlistProducts(saved);
  }

  // Remove product from wishlist
  public async removeFromWishlist(userId: string, productId: string): Promise<any> {
    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );

    const saved = await this.wishlistRepo.save(wishlist);
    return this.populateWishlistProducts(saved);
  }

  // Move product from wishlist to cart
  public async moveToCart(userId: string, productId: string): Promise<void> {
    const wishlist = await this.wishlistRepo.getOrCreateWishlist(userId);

    const exists = wishlist.products.some(
      (p) => p.toString() === productId
    );

    if (!exists) {
      throw new NotFoundError('Product not found in wishlist');
    }

    // Add to cart first (will validate stock inside)
    await cartService.addToCart(userId, productId, 1);

    // Remove from wishlist
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );
    await this.wishlistRepo.save(wishlist);
  }

  // Helper to populate product details in-memory for a Wishlist document
  public async populateWishlistProducts(wishlist: IWishlist): Promise<any> {
    const wishlistObj = wishlist.toObject();
    const productIds = wishlistObj.products.map((p: any) => p.toString());
    if (productIds.length === 0) return wishlistObj;

    try {
      const products = await catalogClient.getProductsInBulk(productIds);
      const productMap = new Map<string, ICatalogProduct>();
      products.forEach(p => productMap.set(p._id.toString(), p));

      wishlistObj.products = productIds.map((id: string) => {
        return productMap.get(id) || {
          _id: id,
          name: 'Unknown Product',
          price: 0,
          stock: 0,
          images: [],
          isActive: false,
        };
      });
    } catch (err) {
      logger.error('Failed to populate wishlist products via REST', err);
    }

    return wishlistObj;
  }
}

export const wishlistService = new WishlistService();
export default wishlistService;
