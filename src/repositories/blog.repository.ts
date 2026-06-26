import { Blog, IBlog } from '../models/blog.model';
import { FilterQuery } from 'mongoose';

export class BlogRepository {
  // Find blog by ID
  public async findById(id: string): Promise<IBlog | null> {
    return Blog.findById(id).populate('author', 'name email').exec();
  }

  // Find blog by slug
  public async findBySlug(slug: string): Promise<IBlog | null> {
    return Blog.findOne({ slug }).populate('author', 'name email').exec();
  }

  // Create blog
  public async create(blogData: Partial<IBlog>): Promise<IBlog> {
    const blog = new Blog(blogData);
    return blog.save();
  }

  // Update blog
  public async update(id: string, updateData: Partial<IBlog>): Promise<IBlog | null> {
    return Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('author', 'name email').exec();
  }

  // Delete blog
  public async delete(id: string): Promise<IBlog | null> {
    return Blog.findByIdAndDelete(id).exec();
  }

  // Find and count blogs with pagination
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
        .populate('author', 'name email')
        .exec(),
      Blog.countDocuments(filter).exec(),
    ]);

    return { blogs, total };
  }
}

export const blogRepository = new BlogRepository();
export default blogRepository;
