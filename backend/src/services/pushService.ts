import webpush from 'web-push';
import { db } from '../config/db.js';
import { pushSubscriptions } from '../config/schema.js';
import { eq } from 'drizzle-orm';

// Configure web-push with VAPID details
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    notificationId?: string;
  };
}

// Send push notification to a user
export const sendPushNotification = async (
  userId: string,
  payload: PushNotificationPayload
): Promise<boolean> => {
  try {
    // Get all push subscriptions for this user
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    if (subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return false;
    }

    // Send to all subscriptions (user might have multiple devices)
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error: any) {
          // If subscription is invalid (410 Gone), remove it
          if (error.statusCode === 410) {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, subscription.id));
            console.log(`Removed invalid subscription ${subscription.id}`);
          }
          throw error;
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Push notifications sent: ${successCount}/${subscriptions.length}`);
    
    return successCount > 0;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
};

// Save a push subscription
export const savePushSubscription = async (
  userId: string,
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
): Promise<boolean> => {
  try {
    // Check if subscription already exists
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint));

    if (existing.length > 0) {
      console.log('Push subscription already exists');
      return true;
    }

    await db.insert(pushSubscriptions).values({
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });

    console.log(`Push subscription saved for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return false;
  }
};

// Remove a push subscription
export const removePushSubscription = async (
  endpoint: string
): Promise<boolean> => {
  try {
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));

    console.log('Push subscription removed');
    return true;
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return false;
  }
};
