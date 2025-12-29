import { api } from '../utils/apiClient';
import { Notification, NotificationResponse } from '../models';

export const getUserNotifications = async (userId: string): Promise<NotificationResponse> => {
  return api.get<NotificationResponse>(`/api/notifications/${userId}`);
};

export const getUnreadNotifications = async (userId: string): Promise<NotificationResponse> => {
  return api.get<NotificationResponse>(`/api/notifications/${userId}`, { unreadOnly: 'true' });
};

export const markNotificationAsRead = async (notificationId: number, userId: string): Promise<Notification> => {
  return api.put<Notification>(`/api/notifications/${notificationId}/read`, { userId });
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  await api.put<void>(`/api/notifications/${userId}/read-all`);
};

export const deleteNotification = async (notificationId: number, userId: string): Promise<void> => {
  await api.delete<void>(`/api/notifications/${notificationId}`);
};
