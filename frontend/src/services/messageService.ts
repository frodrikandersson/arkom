import { api } from '../utils/apiClient';
import { Conversation, Message } from '../models';

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  const data = await api.get<{ conversations: Conversation[] }>(`/api/messages/conversations/${userId}`);
  return data.conversations || [];
};

export const getMessages = async (conversationId: number): Promise<Message[]> => {
  const data = await api.get<{ messages: Message[] }>(`/api/messages/${conversationId}`);
  return data.messages || [];
};

export const sendMessage = async (
  senderId: string,
  recipientId: string,
  content?: string,
  file?: File
): Promise<Message> => {
  const messageId = crypto.randomUUID();
  
  const formData = new FormData();
  formData.append('messageId', messageId);
  formData.append('senderId', senderId);
  formData.append('recipientId', recipientId);
  if (content) formData.append('content', content);
  if (file) formData.append('file', file);

  const data = await api.uploadFile<{ message: Message }>('/api/messages/send', formData);
  return data.message;
};

export const markAsRead = async (conversationId: number, userId: string): Promise<void> => {
  await api.post<void>('/api/messages/mark-read', { conversationId, userId });
};

export const hideConversation = async (conversationId: number, userId: string): Promise<void> => {
  await api.post<void>('/api/messages/hide', { conversationId, userId });
};

export const getDownloadUrl = async (fileUrl: string, fileName: string): Promise<{ downloadUrl: string }> => {
  return api.get<{ downloadUrl: string }>('/api/messages/download-url', { fileUrl, fileName });
};
