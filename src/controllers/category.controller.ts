import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(32),
  parentCategory: z.string().nullable().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(32).optional(),
  parentCategory: z.string().nullable().optional(),
});

export class CategoryController {
  // Get category tree
  public async getTree(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tree = await categoryService.getCategoryTree();
      res.status(200).json({
        status: 'success',
        data: { categories: tree },
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new category
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedBody = createCategorySchema.parse(req.body);
      const category = await categoryService.createCategory(
        validatedBody.name,
        validatedBody.parentCategory
      );

      res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update category
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedBody = updateCategorySchema.parse(req.body);
      const category = await categoryService.updateCategory(id, validatedBody);

      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete category
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);

      res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
export default categoryController;
