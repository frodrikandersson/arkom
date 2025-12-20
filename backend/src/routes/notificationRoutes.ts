import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// GET /api/notifications/:userId - Get user's notifications
router.get('/:userId', getUserNotifications);

// PUT /api/notifications/:notificationId/read - Mark notification as read
router.put('/:notificationId/read', markNotificationAsRead);

// PUT /api/notifications/:userId/read-all - Mark all notifications as read
router.put('/:userId/read-all', markAllNotificationsAsRead);

// DELETE /api/notifications/:notificationId - Delete a notification
router.delete('/:notificationId', deleteNotification);

export default router;
