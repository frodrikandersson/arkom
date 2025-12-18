export interface Conversation {
  id: number;
  participantOneId: string;
  participantTwoId: string;
  lastMessageAt: Date;
  createdAt: Date;
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
