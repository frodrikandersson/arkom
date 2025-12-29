import { useState, useEffect, useCallback } from 'react';
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

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserNotifications(userId);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
      await deleteNotificationService(notificationId, userId);
      
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
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const pollInterval = setInterval(() => {
      if (userId) {
        fetchNotifications();
      }
    }, 3000); // 30 seconds
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchNotifications, userId]);


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
