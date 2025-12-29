import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { notifications, userSettings } from '../config/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { sendNotificationEmail } from '../services/emailService.js';
import { sendPushNotification } from '../services/pushService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Get all notifications for a user
export const getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { unreadOnly } = req.query;

  let query = db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  if (unreadOnly === 'true') {
    query = db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .orderBy(desc(notifications.createdAt));
  }

  const result = await query;

  res.json({
    notifications: result,
    unreadCount: result.filter(n => !n.isRead).length,
  });
});

// Mark notification as read
export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  const { userId } = req.body;

  // Verify the notification belongs to the user
  const [notification] = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, parseInt(notificationId)));

  if (!notification) {
    throw new AppError(404, 'Notification not found');
  }

  if (notification.userId !== userId) {
    throw new AppError(403, 'Unauthorized');
  }

  const [updated] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, parseInt(notificationId)))
    .returning();

  res.json(updated);
});

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      )
    );

  res.json({ success: true });
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  const { userId } = req.body;

  // Verify the notification belongs to the user
  const [notification] = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, parseInt(notificationId)));

  if (!notification) {
    throw new AppError(404, 'Notification not found');
  }

  if (notification.userId !== userId) {
    throw new AppError(403, 'Unauthorized');
  }

  await db
    .delete(notifications)
    .where(eq(notifications.id, parseInt(notificationId)));

  res.json({ success: true });
});

// Keep createNotification as-is since it's not a route handler
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string,
  relatedUserId?: string,
  actionUrl?: string
) => {
  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        relatedId: relatedId || null,
        relatedUserId: relatedUserId || null,
        actionUrl: actionUrl || null,
        isRead: false,
      })
      .returning();

    // Get user notification settings
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    // Send email notification if enabled
    if (settings?.emailNotifications) {
      try {
        const emailResult = await sendNotificationEmail(userId, type, title, message, actionUrl);
        console.log('Email sent successfully:', emailResult);
      } catch (err) {
        console.error('Email notification failed:', err);
      }
    }

    // Send push notification if enabled
    if (settings?.pushNotifications) {
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const fullActionUrl = actionUrl ? `${frontendUrl}${actionUrl}` : undefined;

        const pushResult = await sendPushNotification(userId, {
          title,
          body: message,
          icon: `${frontendUrl}/icon-192.png`,
          badge: `${frontendUrl}/badge-96.png`,
          data: {
            url: fullActionUrl,
            notificationId: notification.id.toString(),
          },
        });
        console.log('Push notification sent successfully:', pushResult);
      } catch (err) {
        console.error('Push notification failed:', err);
      }
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};