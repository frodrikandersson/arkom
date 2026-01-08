import { Router } from 'express';
import { register, login, getCurrentUser, requestPasswordReset, resetPassword, validateResetToken } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { passwordResetLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Password reset routes (public with strict rate limiting)
router.post('/forgot-password', passwordResetLimiter, requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.get('/reset-password/:token', validateResetToken);

// Protected routes
router.get('/me', requireAuth, getCurrentUser);

export default router;
