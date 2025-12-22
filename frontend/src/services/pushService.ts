import { config } from '../config/env';

// Get VAPID public key from backend environment
const VAPID_PUBLIC_KEY = 'BFJ_G-tS0dZ7LDpQzcmuyFWBbzLPjwTy0K78jyqKagYX09Xq6TY162bTAVruLh-CHT1V1UpPrxB5VI70Ls3P6Xw';

// Convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


// Check if push notifications are supported
export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

// Check current notification permission
export const getNotificationPermission = (): NotificationPermission => {
  return Notification.permission;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  return await Notification.requestPermission();
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (userId: string): Promise<boolean> => {
  try {
    // Check if push is supported
    if (!isPushSupported()) {
      console.error('Push notifications not supported');
      return false;
    }

    // Request permission if not already granted
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Register service worker if not already registered
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    }

    // Send subscription to backend
    const res = await fetch(`${config.apiUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscription: subscription.toJSON(),
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to save push subscription');
    }

    console.log('Successfully subscribed to push notifications');
    return true;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return false;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    // Unsubscribe from push manager
    await subscription.unsubscribe();

    // Remove from backend
    const res = await fetch(`${config.apiUrl}/api/push/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to remove push subscription from backend');
    }

    console.log('Successfully unsubscribed from push notifications');
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
};

// Check if user is currently subscribed
export const isPushSubscribed = async (): Promise<boolean> => {
  try {
    if (!isPushSupported()) return false;

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('Failed to check push subscription status:', error);
    return false;
  }
};

// Test notification (for debugging)
export const sendTestNotification = async () => {
  if (!isPushSupported()) {
    alert('Push notifications not supported');
    return;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    alert('Notification permission denied');
    return;
  }

  new Notification('Test Notification', {
    body: 'This is a test notification from Arkom!',
    icon: '/icon-192.png',
    badge: '/badge-96.png',
  });
};
