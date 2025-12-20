export interface Notification {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string | null;
  relatedUserId?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
}