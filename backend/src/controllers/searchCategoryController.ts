import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { catalogues, categories, subCategoryFilters, subCategoryFilterOptions, categorySubCategoryFilters } from '../config/schema.js';
import { eq, asc } from 'drizzle-orm';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Get all catalogues
export const getCatalogues = asyncHandler(async (req: Request, res: Response) => {
  const catalogueList = await db
    .select()
    .from(catalogues)
    .where(eq(catalogues.isActive, true))
    .orderBy(asc(catalogues.sortOrder));

  res.json({
    success: true,
    catalogues: catalogueList,
  });
});

// Get categories by catalogue ID
export const getCategoriesByCatalogue = asyncHandler(async (req: Request, res: Response) => {
  const { catalogueId } = req.params;
  const catalogueIdInt = parseInt(catalogueId);

  const categoryList = await db
    .select()
    .from(categories)
    .where(eq(categories.catalogueId, catalogueIdInt))
    .orderBy(asc(categories.sortOrder));

  res.json({
    success: true,
    categories: categoryList,
  });
});

// Get all sub-category filters with their options
export const getSubCategoryFilters = asyncHandler(async (req: Request, res: Response) => {
  const filters = await db
    .select()
    .from(subCategoryFilters)
    .where(eq(subCategoryFilters.isActive, true))
    .orderBy(asc(subCategoryFilters.sortOrder));

  const filtersWithOptions = await Promise.all(
    filters.map(async (filter) => {
      const options = await db
        .select()
        .from(subCategoryFilterOptions)
        .where(eq(subCategoryFilterOptions.filterId, filter.id))
        .orderBy(asc(subCategoryFilterOptions.sortOrder));

      // Count how many categories this filter is assigned to
      const categoryCount = await db
        .select()
        .from(categorySubCategoryFilters)
        .where(eq(categorySubCategoryFilters.filterId, filter.id));

      return {
        ...filter,
        options,
        categoryCount: categoryCount.length,
      };
    })
  );

  res.json({
    success: true,
    filters: filtersWithOptions,
  });
});


// Admin-only endpoints below
// Create catalogue
export const createCatalogue = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin check
  const { name, sortOrder } = req.body;

  if (!name) {
    throw new AppError(400, 'Catalogue name is required');
  }

  const [catalogue] = await db
    .insert(catalogues)
    .values({ name, sortOrder: sortOrder ?? 0 })
    .returning();

  res.status(201).json({
    success: true,
    catalogue,
  });
});

// Update catalogue
export const updateCatalogue = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin check
  const { id } = req.params;
  const { name, sortOrder, isActive } = req.body;

  const [updated] = await db
    .update(catalogues)
    .set({
      ...(name && { name }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date(),
    })
    .where(eq(catalogues.id, parseInt(id)))
    .returning();

  if (!updated) {
    throw new AppError(404, 'Catalogue not found');
  }

  res.json({
    success: true,
    catalogue: updated,
  });
});

// Delete catalogue
export const deleteCatalogue = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin check
  const { id } = req.params;

  await db.delete(catalogues).where(eq(catalogues.id, parseInt(id)));

  res.json({
    success: true,
    message: 'Catalogue deleted successfully',
  });
});

// Create category
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin check
  const { catalogueId, name, sortOrder } = req.body;

  if (!catalogueId || !name) {
    throw new AppError(400, 'Catalogue ID and name are required');
  }

  const [category] = await db
    .insert(categories)
    .values({ catalogueId, name, sortOrder: sortOrder ?? 0 })
    .returning();

  res.status(201).json({
    success: true,
    category,
  });
});

// Update category
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin check
  const { id } = req.params;
  const { name, sortOrder, isActive } = req.body;

  const [updated] = await db
    .update(categories)
    .set({
      ...(name && { name }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date(),
    })
    .where(eq(categories.id, parseInt(id)))
    .returning();

  if (!updated) {
    throw new AppError(404, 'Category not found');
  }

  res.json({
    success: true,
    category: updated,
  });
});

// Delete category
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin check
  const { id } = req.params;

  await db.delete(categories).where(eq(categories.id, parseInt(id)));

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

// Similar CRUD for sub-category filters and options...
export const createSubCategoryFilter = asyncHandler(async (req: Request, res: Response) => {
  const { name, sortOrder } = req.body;

  if (!name) {
    throw new AppError(400, 'Filter name is required');
  }

  const [filter] = await db
    .insert(subCategoryFilters)
    .values({ name, sortOrder: sortOrder ?? 0 })
    .returning();

  res.status(201).json({
    success: true,
    filter,
  });
});

export const createSubCategoryFilterOption = asyncHandler(async (req: Request, res: Response) => {
  const { filterId, name, sortOrder } = req.body;

  if (!filterId || !name) {
    throw new AppError(400, 'Filter ID and name are required');
  }

  const [option] = await db
    .insert(subCategoryFilterOptions)
    .values({ filterId, name, sortOrder: sortOrder ?? 0 })
    .returning();

  res.status(201).json({
    success: true,
    option,
  });
});

// Update sub-category filter
export const updateSubCategoryFilter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, sortOrder, isActive } = req.body;

  const [updated] = await db
    .update(subCategoryFilters)
    .set({
      ...(name && { name }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date(),
    })
    .where(eq(subCategoryFilters.id, parseInt(id)))
    .returning();

  if (!updated) {
    throw new AppError(404, 'Filter not found');
  }

  res.json({
    success: true,
    filter: updated,
  });
});

// Delete sub-category filter
export const deleteSubCategoryFilter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await db.delete(subCategoryFilters).where(eq(subCategoryFilters.id, parseInt(id)));

  res.json({
    success: true,
    message: 'Filter deleted successfully',
  });
});

// Update sub-category filter option
export const updateSubCategoryFilterOption = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, sortOrder, isActive } = req.body;

  const [updated] = await db
    .update(subCategoryFilterOptions)
    .set({
      ...(name && { name }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date(),
    })
    .where(eq(subCategoryFilterOptions.id, parseInt(id)))
    .returning();

  if (!updated) {
    throw new AppError(404, 'Option not found');
  }

  res.json({
    success: true,
    option: updated,
  });
});

// Delete sub-category filter option
export const deleteSubCategoryFilterOption = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await db.delete(subCategoryFilterOptions).where(eq(subCategoryFilterOptions.id, parseInt(id)));

  res.json({
    success: true,
    message: 'Option deleted successfully',
  });
});

// Get filters assigned to a category
export const getCategoryFilters = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const categoryIdInt = parseInt(categoryId);

  const result = await db
    .select({
      id: subCategoryFilters.id,
      name: subCategoryFilters.name,
      sortOrder: subCategoryFilters.sortOrder,
      isActive: subCategoryFilters.isActive,
    })
    .from(categorySubCategoryFilters)
    .innerJoin(subCategoryFilters, eq(categorySubCategoryFilters.filterId, subCategoryFilters.id))
    .where(eq(categorySubCategoryFilters.categoryId, categoryIdInt))
    .orderBy(asc(subCategoryFilters.sortOrder));

  // Fetch options for each filter
  const filtersWithOptions = await Promise.all(
    result.map(async (filter) => {
      const options = await db
        .select()
        .from(subCategoryFilterOptions)
        .where(eq(subCategoryFilterOptions.filterId, filter.id))
        .orderBy(asc(subCategoryFilterOptions.sortOrder));

      return {
        ...filter,
        options,
      };
    })
  );

  res.json({
    success: true,
    filters: filtersWithOptions,
  });
});

// Assign a filter to a category
export const assignFilterToCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, filterId } = req.body;

  if (!categoryId || !filterId) {
    throw new AppError(400, 'Category ID and Filter ID are required');
  }

  const [assignment] = await db
    .insert(categorySubCategoryFilters)
    .values({ categoryId, filterId })
    .returning();

  res.status(201).json({
    success: true,
    assignment,
  });
});

// Remove a filter from a category
export const removeFilterFromCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, filterId } = req.params;

  await db
    .delete(categorySubCategoryFilters)
    .where(
      eq(categorySubCategoryFilters.categoryId, parseInt(categoryId)) &&
      eq(categorySubCategoryFilters.filterId, parseInt(filterId))
    );

  res.json({
    success: true,
    message: 'Filter removed from category successfully',
  });
});
