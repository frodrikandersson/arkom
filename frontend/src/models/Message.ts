export interface Conversation {
  conversationId: number;
  otherUserId: string;
  otherUserName?: string;
  otherUserUsername?: string;
  otherUserAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  isRead: boolean;
  createdAt: Date;
}
