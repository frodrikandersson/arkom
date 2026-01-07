import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { serviceCategories } from '../config/schema.js';
import { eq, and, asc } from 'drizzle-orm';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Get all categories for a user
export const getUserCategories = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const categories = await db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.userId, userId))
    .orderBy(asc(serviceCategories.sortOrder));

  res.json({
    success: true,
    categories,
  });
});

// Create a new category
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name, sortOrder } = req.body;

  if (!name || name.trim().length === 0) {
    throw new AppError(400, 'Category name is required');
  }

  if (name.trim().length > 50) {
    throw new AppError(400, 'Category name must be 50 characters or less');
  }

  const [category] = await db
    .insert(serviceCategories)
    .values({
      userId,
      name: name.trim(),
      sortOrder: sortOrder ?? 0,
    })
    .returning();

  res.status(201).json({
    success: true,
    category,
  });
});

// Update a category
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { name } = req.body;

  const categoryId = parseInt(id);

  // Verify ownership
  const [existing] = await db
    .select()
    .from(serviceCategories)
    .where(
      and(
        eq(serviceCategories.id, categoryId),
        eq(serviceCategories.userId, userId)
      )
    );

  if (!existing) {
    throw new AppError(404, 'Category not found');
  }

  if (!name || name.trim().length === 0) {
    throw new AppError(400, 'Category name is required');
  }

  if (name.trim().length > 50) {
    throw new AppError(400, 'Category name must be 50 characters or less');
  }

  const [updated] = await db
    .update(serviceCategories)
    .set({
      name: name.trim(),
      updatedAt: new Date(),
    })
    .where(eq(serviceCategories.id, categoryId))
    .returning();

  res.json({
    success: true,
    category: updated,
  });
});

// Delete a category
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const categoryId = parseInt(id);

  // Verify ownership
  const [existing] = await db
    .select()
    .from(serviceCategories)
    .where(
      and(
        eq(serviceCategories.id, categoryId),
        eq(serviceCategories.userId, userId)
      )
    );

  if (!existing) {
    throw new AppError(404, 'Category not found');
  }

  await db
    .delete(serviceCategories)
    .where(eq(serviceCategories.id, categoryId));

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

// Update category sort order (bulk update)
export const updateCategorySortOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { updates } = req.body; // Array of { id, sortOrder }

  if (!Array.isArray(updates)) {
    throw new AppError(400, 'Updates must be an array');
  }

  // Update each category's sort order
  for (const update of updates) {
    const { id, sortOrder } = update;
    
    // Verify ownership
    const [existing] = await db
      .select()
      .from(serviceCategories)
      .where(
        and(
          eq(serviceCategories.id, id),
          eq(serviceCategories.userId, userId)
        )
      );

    if (existing) {
      await db
        .update(serviceCategories)
        .set({ sortOrder, updatedAt: new Date() })
        .where(eq(serviceCategories.id, id));
    }
  }

  res.json({
    success: true,
    message: 'Sort order updated successfully',
  });
});
