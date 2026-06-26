import { Product, IProduct } from '../models/product.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class ProductRepository {
  // Find product by ID and populate category
  public async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id).populate('category', 'name slug').exec();
  }

  // Find product by slug
  public async findBySlug(slug: string): Promise<IProduct | null> {
    return Product.findOne({ slug, isActive: true }).populate('category', 'name slug').exec();
  }

  // Create product
  public async create(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    return product.save();
  }

  // Update product
  public async update(id: string, updateData: UpdateQuery<IProduct>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug').exec();
  }

  // Delete product
  public async delete(id: string): Promise<IProduct | null> {
    return Product.findByIdAndDelete(id).exec();
  }

  // Query products with advanced filters, pagination, and sorting
  public async findAndCount(
    filter: FilterQuery<IProduct>,
    skip = 0,
    limit = 12,
    sort: any = { createdAt: -1 }
  ): Promise<{ products: IProduct[]; total: number }> {
    const query = Product.find(filter);

    // If text search is active, project text score and sort by it if no explicit sort
    const hasTextSearch = filter.$text !== undefined;
    if (hasTextSearch && !sort.price && !sort.averageRating && !sort.createdAt) {
      query.select({ score: { $meta: 'textScore' } });
      sort = { score: { $meta: 'textScore' } };
    }

    const [products, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(limit).populate('category', 'name slug').exec(),
      Product.countDocuments(filter).exec(),
    ]);

    return { products, total };
  }

  // Count products in a specific category
  public async countByCategory(categoryId: string): Promise<number> {
    return Product.countDocuments({ category: categoryId }).exec();
  }

  // Update product stock (Atomic operation to prevent race conditions)
  public async adjustStock(id: string, quantity: number): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      id,
      { $inc: { stock: quantity } },
      { new: true, runValidators: true }
    ).exec();
  }
}

export const productRepository = new ProductRepository();
export default productRepository;
