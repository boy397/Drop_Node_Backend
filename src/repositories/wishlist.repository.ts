import { Wishlist, IWishlist } from '../models/wishlist.model';

export class WishlistRepository {
  // Find wishlist by user ID and populate products
  public async findByUserId(userId: string): Promise<IWishlist | null> {
    return Wishlist.findOne({ user: userId })
      .populate('products', 'name slug price compareAtPrice stock images isActive')
      .exec();
  }

  // Get or create wishlist
  public async getOrCreateWishlist(userId: string): Promise<IWishlist> {
    let wishlist = await this.findByUserId(userId);
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
      await wishlist.save();
      // Re-populate after save
      wishlist = await this.findByUserId(userId) || wishlist;
    }
    return wishlist;
  }

  // Save wishlist
  public async save(wishlist: IWishlist): Promise<IWishlist> {
    await wishlist.save();
    return (await this.findByUserId(wishlist.user.toString())) || wishlist;
  }
}

export const wishlistRepository = new WishlistRepository();
export default wishlistRepository;
