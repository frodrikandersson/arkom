import express from 'express';
import { checkAdminStatus } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/check', requireAuth, checkAdminStatus);

export default router;
