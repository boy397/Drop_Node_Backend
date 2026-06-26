import { Category, ICategory } from '../models/category.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class CategoryRepository {
  // Find category by slug
  public async findBySlug(slug: string): Promise<ICategory | null> {
    return Category.findOne({ slug }).exec();
  }

  // Find category by ID
  public async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id).exec();
  }

  // Create category
  public async create(categoryData: Partial<ICategory>): Promise<ICategory> {
    const category = new Category(categoryData);
    return category.save();
  }

  // Update category
  public async update(id: string, updateData: UpdateQuery<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  // Delete category
  public async delete(id: string): Promise<ICategory | null> {
    return Category.findByIdAndDelete(id).exec();
  }

  // Find all categories
  public async findAll(filter: FilterQuery<ICategory> = {}): Promise<ICategory[]> {
    return Category.find(filter).sort({ name: 1 }).exec();
  }

  // Check if category has subcategories
  public async hasChildren(id: string): Promise<boolean> {
    const count = await Category.countDocuments({ parentCategory: id }).exec();
    return count > 0;
  }
}

export const categoryRepository = new CategoryRepository();
export default categoryRepository;
