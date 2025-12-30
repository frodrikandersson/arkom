import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All notification routes require authentication
router.get('/:userId', requireAuth, getUserNotifications);
router.put('/:notificationId/read', requireAuth, markNotificationAsRead);
router.put('/:userId/read-all', requireAuth, markAllNotificationsAsRead);
router.delete('/:notificationId', requireAuth, deleteNotification);

export default router;
