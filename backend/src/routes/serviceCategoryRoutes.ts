// backend/src/routes/serviceCategoryRoutes.ts
import express from 'express';
import {
  getUserCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategorySortOrder,
} from '../controllers/serviceCategoryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Category routes
router.get('/categories', getUserCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.put('/categories/sort-order', updateCategorySortOrder);

export default router;
