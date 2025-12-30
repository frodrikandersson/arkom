import express from 'express';
import { subscribeToPush, unsubscribeFromPush } from '../controllers/pushController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/push/subscribe - Subscribe to push notifications
router.post('/subscribe', requireAuth, subscribeToPush);

// POST /api/push/unsubscribe - Unsubscribe from push notifications
router.post('/unsubscribe', requireAuth, unsubscribeFromPush);

export default router;
