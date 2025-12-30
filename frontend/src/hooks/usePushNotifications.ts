import { useState, useEffect } from 'react';
import { subscribePush, unsubscribePush } from '../services/pushService';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const usePushNotifications = (userId: string | null) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, [userId]);

  // Check if already subscribed
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Failed to check subscription:', err);
    }
  };

  // Request permission and subscribe
  const subscribe = async () => {
    if (!userId || !isSupported) return;

    try {
      setLoading(true);
      setError(null);

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Notification permission denied');
        return;
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
      }

      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to backend via service
      await subscribePush(userId, subscription.toJSON());

      setIsSubscribed(true);
    } catch (err: any) {
      console.error('Push subscription failed:', err);
      setError(err.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Remove from backend via service
        await unsubscribePush(subscription.endpoint);

        // Unsubscribe from browser
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (err: any) {
      console.error('Push unsubscription failed:', err);
      setError(err.message || 'Failed to unsubscribe');
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
