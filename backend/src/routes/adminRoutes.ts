import express from 'express';
import { checkAdminStatus, getAllUsers, updateUserAdminStatus } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Check if user is admin
router.get('/status', requireAuth, checkAdminStatus);

// User management
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.patch('/users/:userId/admin', requireAuth, requireAdmin, updateUserAdminStatus);

export default router;
