import { blogRepository, BlogRepository } from '../repositories/blog.repository';
import { IBlog } from '../models/blog.model';
import { BadRequestError, NotFoundError } from '@shared/errors/app-error';

export class BlogService {
  private blogRepo: BlogRepository;

  constructor(blogRepo = blogRepository) {
    this.blogRepo = blogRepo;
  }

  // Create a new blog post
  public async createPost(blogData: Partial<IBlog>, authorId: string): Promise<IBlog> {
    if (!blogData.title || !blogData.content || !blogData.category) {
      throw new BadRequestError('Title, content, and category are required');
    }

    const slug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const blog = await this.blogRepo.create({
      ...blogData,
      slug,
      author: authorId as any,
      isPublished: blogData.isPublished || false,
    });

    return blog;
  }

  // Get single blog post by slug
  public async getPostBySlug(slug: string): Promise<IBlog> {
    const blog = await this.blogRepo.findBySlug(slug);
    if (!blog) {
      throw new NotFoundError('Blog post not found');
    }
    return blog;
  }

  // Update a blog post
  public async updatePost(id: string, updateData: Partial<IBlog>): Promise<IBlog> {
    const blog = await this.blogRepo.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog post not found');
    }

    if (updateData.title && updateData.title !== blog.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    }

    const updated = await this.blogRepo.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Blog post not found');
    }

    return updated;
  }

  // Delete a blog post
  public async deletePost(id: string): Promise<void> {
    const blog = await this.blogRepo.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog post not found');
    }
    await this.blogRepo.delete(id);
  }

  // Get blogs with pagination
  public async getBlogs(
    query: { page?: string; limit?: string; tag?: string; category?: string; search?: string },
    isAdmin = false
  ): Promise<{ blogs: IBlog[]; total: number; page: number; pages: number }> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (!isAdmin) {
      filter.isPublished = true;
    }

    if (query.tag) {
      filter.tags = query.tag;
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { content: { $regex: query.search, $options: 'i' } },
      ];
    }

    const { blogs, total } = await this.blogRepo.findAndCount(filter, skip, limit);

    return {
      blogs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}

export const blogService = new BlogService();
export default blogService;
