import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '../models';
import {
  getUserNotifications,
  markNotificationAsRead as markReadService,
  markAllNotificationsAsRead as markAllReadService,
  deleteNotification as deleteNotificationService,
} from '../services/notificationService';

export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const errorCountRef = useRef(0); // Track consecutive errors
  const isFirstFetchRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Only set loading on first fetch to avoid layout shifts
      if (isFirstFetchRef.current) {
        setLoading(true);
      }
      
      const data = await getUserNotifications(userId);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      
      // Reset error state on success
      if (error) {
        setError(null);
      }
      errorCountRef.current = 0;
      
      if (isFirstFetchRef.current) {
        isFirstFetchRef.current = false;
        setLoading(false);
      }
    } catch (err: any) {
      errorCountRef.current++;
      
      // Only update error state after multiple consecutive failures
      // This prevents single network blips from causing re-renders
      if (errorCountRef.current >= 3) {
        const errorMessage = err.message || 'Failed to fetch notifications';
        // Only set error if it's different to avoid unnecessary re-renders
        if (error !== errorMessage) {
          setError(errorMessage);
        }
        console.error('Fetch notifications error (3+ failures):', err);
      } else {
        // Silent failure for first 2 errors - just log to console
        console.warn(`Fetch notifications warning (${errorCountRef.current}/3):`, err);
      }
    } finally {
      if (isFirstFetchRef.current) {
        setLoading(false);
      }
    }
  }, [userId, error]); // Include error in deps to check if it changed

  const markAsRead = useCallback(async (notificationId: number) => {
    if (!userId) return;

    try {
      await markReadService(notificationId, userId);
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Mark as read error:', err);
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await markAllReadService(userId);
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Mark all as read error:', err);
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notificationId: number) => {
    if (!userId) return;

    try {
      await deleteNotificationService(notificationId);

      setNotifications(prev => {
        const deleted = prev.find(n => n.id === notificationId);
        const newNotifications = prev.filter(n => n.id !== notificationId);
        
        if (deleted && !deleted.isRead) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        
        return newNotifications;
      });
    } catch (err: any) {
      console.error('Delete notification error:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    
    // Reset refs when userId changes
    isFirstFetchRef.current = true;
    errorCountRef.current = 0;
    
    fetchNotifications(); // Initial fetch
    
    // Poll every 5 seconds (reduced from 3 seconds to reduce network load)
    const pollInterval = setInterval(fetchNotifications, 5000);
    
    return () => {
      clearInterval(pollInterval);
      // Reset refs on cleanup
      isFirstFetchRef.current = true;
      errorCountRef.current = 0;
    };
  }, [userId]); // Only userId in deps, fetchNotifications is stable

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
