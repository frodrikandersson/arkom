import { config } from '../config/env';
import { Notification, NotificationResponse } from '../models';

export const getUserNotifications = async (userId: string): Promise<NotificationResponse> => {
  const res = await fetch(`${config.apiUrl}/api/notifications/${userId}`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch notifications');
  }
  
  return data;
};

export const getUnreadNotifications = async (userId: string): Promise<NotificationResponse> => {
  const res = await fetch(`${config.apiUrl}/api/notifications/${userId}?unreadOnly=true`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch unread notifications');
  }
  
  return data;
};

export const markNotificationAsRead = async (notificationId: number, userId: string): Promise<Notification> => {
  const res = await fetch(`${config.apiUrl}/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to mark notification as read');
  }
  
  return data;
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const res = await fetch(`${config.apiUrl}/api/notifications/${userId}/read-all`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to mark all notifications as read');
  }
};

export const deleteNotification = async (notificationId: number, userId: string): Promise<void> => {
  const res = await fetch(`${config.apiUrl}/api/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete notification');
  }
};
