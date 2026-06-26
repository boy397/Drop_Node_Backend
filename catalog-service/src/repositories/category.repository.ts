import { Category, ICategory } from '../models/category.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class CategoryRepository {
  public async findBySlug(slug: string): Promise<ICategory | null> {
    return Category.findOne({ slug }).exec();
  }

  public async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id).exec();
  }

  public async create(categoryData: Partial<ICategory>): Promise<ICategory> {
    const category = new Category(categoryData);
    return category.save();
  }

  public async update(id: string, updateData: UpdateQuery<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  public async delete(id: string): Promise<ICategory | null> {
    return Category.findByIdAndDelete(id).exec();
  }

  public async findAll(filter: FilterQuery<ICategory> = {}): Promise<ICategory[]> {
    return Category.find(filter).sort({ name: 1 }).exec();
  }

  public async hasChildren(id: string): Promise<boolean> {
    const count = await Category.countDocuments({ parentCategory: id }).exec();
    return count > 0;
  }
}

export const categoryRepository = new CategoryRepository();
export default categoryRepository;
