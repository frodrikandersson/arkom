// backend/src/routes/searchCategoryRoutes.ts
import express from 'express';
import {
    getCatalogues,
    getCategoriesByCatalogue,
    getSubCategoryFilters,
    createCatalogue,
    updateCatalogue,
    deleteCatalogue,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubCategoryFilter,
    createSubCategoryFilterOption,
    updateSubCategoryFilter,
    deleteSubCategoryFilter,
    updateSubCategoryFilterOption,
    deleteSubCategoryFilterOption,
} from '../controllers/searchCategoryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';


const router = express.Router();

// Public routes
router.get('/catalogues', getCatalogues);
router.get('/catalogues/:catalogueId/categories', getCategoriesByCatalogue);
router.get('/sub-category-filters', getSubCategoryFilters);

// Admin routes - requireAuth sets req.user, requireAdmin checks admin status
router.post('/catalogues', requireAuth, requireAdmin, createCatalogue);
router.put('/catalogues/:id', requireAuth, requireAdmin, updateCatalogue);
router.delete('/catalogues/:id', requireAuth, requireAdmin, deleteCatalogue);

router.post('/categories', requireAuth, requireAdmin, createCategory);
router.put('/categories/:id', requireAuth, requireAdmin, updateCategory);
router.delete('/categories/:id', requireAuth, requireAdmin, deleteCategory);

router.post('/sub-category-filters', requireAuth, requireAdmin, createSubCategoryFilter);
router.post('/sub-category-filter-options', requireAuth, requireAdmin, createSubCategoryFilterOption);
router.put('/sub-category-filters/:id', requireAuth, requireAdmin, updateSubCategoryFilter);
router.delete('/sub-category-filters/:id', requireAuth, requireAdmin, deleteSubCategoryFilter);

router.put('/sub-category-filter-options/:id', requireAuth, requireAdmin, updateSubCategoryFilterOption);
router.delete('/sub-category-filter-options/:id', requireAuth, requireAdmin, deleteSubCategoryFilterOption);

export default router;
