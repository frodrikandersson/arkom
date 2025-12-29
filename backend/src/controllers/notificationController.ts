import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { notifications, userSettings } from '../config/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { sendNotificationEmail } from '../services/emailService.js';
import { sendPushNotification } from '../services/pushService.js';

// Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    // Verify the notification belongs to the user
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, parseInt(notificationId)));

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    if (notification.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, parseInt(notificationId)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    // Verify the notification belongs to the user
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, parseInt(notificationId)));

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    if (notification.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    await db
      .delete(notifications)
      .where(eq(notifications.id, parseInt(notificationId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
        relatedId,
        relatedUserId,
        actionUrl,
      })
      .returning();

    // Check if user has email/push notifications enabled
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
    console.error('Create notification error:', error);
    throw error;
  }
};

