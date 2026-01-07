import { api } from '../utils/apiClient';
import { Conversation, Message } from '../models';

export const getConversations = async (userId: string): Promise<{ success: boolean; conversations: Conversation[] }> => {
  return api.get<{ success: boolean; conversations: Conversation[] }>(`/api/messages/conversations/${userId}`);
};

export const getMessages = async (conversationId: number): Promise<{ success: boolean; messages: Message[] }> => {
  return api.get<{ success: boolean; messages: Message[] }>(`/api/messages/${conversationId}`);
};

export const sendMessage = async (
  senderId: string,
  recipientId: string,
  content?: string,
  file?: File
): Promise<{ success: boolean; message: Message }> => {
  const messageId = crypto.randomUUID();

  const formData = new FormData();
  formData.append('messageId', messageId);
  formData.append('senderId', senderId);
  formData.append('recipientId', recipientId);
  if (content) formData.append('content', content);
  if (file) formData.append('file', file);

  return api.uploadFile<{ success: boolean; message: Message }>('/api/messages/send', formData);
};

export const markAsRead = async (conversationId: number, userId: string): Promise<void> => {
  await api.post<void>('/api/messages/mark-read', { conversationId, userId });
};

export const hideConversation = async (conversationId: number, userId: string): Promise<void> => {
  await api.post<void>('/api/messages/hide', { conversationId, userId });
};

export const getDownloadUrl = async (fileUrl: string, fileName: string): Promise<{ success: boolean; downloadUrl: string }> => {
  return api.get<{ success: boolean; downloadUrl: string }>('/api/messages/download-url', { fileUrl, fileName });
};
