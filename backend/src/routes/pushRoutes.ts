import express from 'express';
import { subscribeToPush, unsubscribeFromPush } from '../controllers/pushController.js';

const router = express.Router();

// POST /api/push/subscribe - Subscribe to push notifications
router.post('/subscribe', subscribeToPush);

// POST /api/push/unsubscribe - Unsubscribe from push notifications
router.post('/unsubscribe', unsubscribeFromPush);

export default router;
