import { Router } from 'express';
import { register, login, getCurrentUser, requestPasswordReset, resetPassword, validateResetToken } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Password reset routes (public)
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/reset-password/:token', validateResetToken);

// Protected routes
router.get('/me', requireAuth, getCurrentUser);

export default router;
