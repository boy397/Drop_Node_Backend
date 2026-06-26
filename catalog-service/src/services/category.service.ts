import { categoryRepository, CategoryRepository } from '../repositories/category.repository';
import { ICategory } from '../models/category.model';
import { BadRequestError, NotFoundError } from '@shared/errors/app-error';
import { redisCache } from '../config/redis.config';
import { logger } from '@shared/utils/logger';

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  parentCategory: string | null;
  children: CategoryNode[];
}

const CATEGORY_TREE_CACHE_KEY = 'categories:tree';

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor(categoryRepo = categoryRepository) {
    this.categoryRepo = categoryRepo;
  }

  // Create a new category
  public async createCategory(name: string, parentCategory?: string | null): Promise<ICategory> {
    if (!name) {
      throw new BadRequestError('Category name is required');
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check if category already exists
    const existing = await this.categoryRepo.findBySlug(slug);
    if (existing) {
      throw new BadRequestError('Category with a similar name already exists');
    }

    // If parent is specified, verify it exists
    if (parentCategory) {
      const parent = await this.categoryRepo.findById(parentCategory);
      if (!parent) {
        throw new NotFoundError('Parent category not found');
      }
    }

    const category = await this.categoryRepo.create({
      name,
      slug,
      parentCategory: parentCategory || null,
    });

    // Invalidate category cache
    await this.invalidateCache();

    return category;
  }

  // Get all categories structured as a tree (Cached with Redis)
  public async getCategoryTree(): Promise<CategoryNode[]> {
    // 1. Try to fetch from cache
    try {
      const cachedTree = await redisCache.get<CategoryNode[]>(CATEGORY_TREE_CACHE_KEY);
      if (cachedTree) {
        logger.info('🧠 Category tree retrieved from cache');
        return cachedTree;
      }
    } catch (err) {
      logger.error('Failed to get category tree from cache', err);
    }

    // 2. Query DB
    const categories = await this.categoryRepo.findAll();

    // 3. Build tree
    const nodeMap = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    // Initialize map
    categories.forEach((cat) => {
      nodeMap.set(cat.id, {
        _id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentCategory: cat.parentCategory ? cat.parentCategory.toString() : null,
        children: [],
      });
    });

    // Structure tree
    nodeMap.forEach((node) => {
      if (node.parentCategory) {
        const parent = nodeMap.get(node.parentCategory);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // 4. Save to cache (cache for 24 hours)
    try {
      await redisCache.set(CATEGORY_TREE_CACHE_KEY, roots, 24 * 60 * 60);
      logger.info('🧠 Category tree saved to cache');
    } catch (err) {
      logger.error('Failed to save category tree to cache', err);
    }

    return roots;
  }

  // Update category
  public async updateCategory(
    id: string,
    updateData: { name?: string; parentCategory?: string | null }
  ): Promise<ICategory> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const { name, parentCategory } = updateData;
    const updateObj: Partial<ICategory> = {};

    if (name) {
      updateObj.name = name;
      updateObj.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      if (updateObj.slug !== category.slug) {
        const existing = await this.categoryRepo.findBySlug(updateObj.slug);
        if (existing) {
          throw new BadRequestError('Category with a similar name already exists');
        }
      }
    }

    if (parentCategory !== undefined) {
      if (parentCategory === id) {
        throw new BadRequestError('A category cannot be its own parent');
      }

      if (parentCategory) {
        const parent = await this.categoryRepo.findById(parentCategory);
        if (!parent) {
          throw new NotFoundError('Parent category not found');
        }
        updateObj.parentCategory = parent._id;
      } else {
        updateObj.parentCategory = null;
      }
    }

    const updated = await this.categoryRepo.update(id, updateObj);
    if (!updated) {
      throw new NotFoundError('Category not found');
    }

    // Invalidate cache
    await this.invalidateCache();

    return updated;
  }

  // Delete category
  public async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const hasChildren = await this.categoryRepo.hasChildren(id);
    if (hasChildren) {
      throw new BadRequestError('Cannot delete category with active subcategories. Delete children first.');
    }

    await this.categoryRepo.delete(id);

    // Invalidate cache
    await this.invalidateCache();
  }

  private async invalidateCache(): Promise<void> {
    try {
      await redisCache.del(CATEGORY_TREE_CACHE_KEY);
      logger.info('🧠 Invalidated category tree cache');
    } catch (err) {
      logger.error('Failed to invalidate category cache', err);
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;
