import { Product, IProduct } from '../models/product.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class ProductRepository {
  public async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id).populate('category', 'name slug').exec();
  }

  public async findBySlug(slug: string): Promise<IProduct | null> {
    return Product.findOne({ slug, isActive: true }).populate('category', 'name slug').exec();
  }

  public async create(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    return product.save();
  }

  public async update(id: string, updateData: UpdateQuery<IProduct>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug').exec();
  }

  public async delete(id: string): Promise<IProduct | null> {
    return Product.findByIdAndDelete(id).exec();
  }

  public async findAndCount(
    filter: FilterQuery<IProduct>,
    skip = 0,
    limit = 12,
    sort: any = { createdAt: -1 }
  ): Promise<{ products: IProduct[]; total: number }> {
    const query = Product.find(filter);

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

  public async countByCategory(categoryId: string): Promise<number> {
    return Product.countDocuments({ category: categoryId }).exec();
  }

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
