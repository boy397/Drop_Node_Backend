import { Blog, IBlog } from '../models/blog.model';
import { FilterQuery } from 'mongoose';

export class BlogRepository {
  public async findById(id: string): Promise<IBlog | null> {
    return Blog.findById(id).exec();
  }

  public async findBySlug(slug: string): Promise<IBlog | null> {
    return Blog.findOne({ slug }).exec();
  }

  public async create(blogData: Partial<IBlog>): Promise<IBlog> {
    const blog = new Blog(blogData);
    return blog.save();
  }

  public async update(id: string, updateData: Partial<IBlog>): Promise<IBlog | null> {
    return Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  public async delete(id: string): Promise<IBlog | null> {
    return Blog.findByIdAndDelete(id).exec();
  }

  public async findAndCount(
    filter: FilterQuery<IBlog>,
    skip = 0,
    limit = 10
  ): Promise<{ blogs: IBlog[]; total: number }> {
    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Blog.countDocuments(filter).exec(),
    ]);

    return { blogs, total };
  }
}

export const blogRepository = new BlogRepository();
export default blogRepository;
