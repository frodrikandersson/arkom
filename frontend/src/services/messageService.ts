import { config } from '../config/env';
import { Conversation, Message } from '../models';


export const getConversations = async (userId: string): Promise<Conversation[]> => {
  const res = await fetch(`${config.apiUrl}/api/messages/conversations/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  const data = await res.json();
  return data.conversations || [];
};

export const getMessages = async (conversationId: number): Promise<Message[]> => {
  const res = await fetch(`${config.apiUrl}/api/messages/${conversationId}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  const data = await res.json();
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

  const res = await fetch(`${config.apiUrl}/api/messages/send`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to send message');
  const data = await res.json();
  return data.message;
};

export const markAsRead = async (conversationId: number, userId: string): Promise<void> => {
  const res = await fetch(`${config.apiUrl}/api/messages/mark-read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, userId }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to mark as read');
  }
};


export const hideConversation = async (conversationId: number, userId: string): Promise<void> => {
  const res = await fetch(`${config.apiUrl}/api/messages/hide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, userId }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to hide conversation');
  }
};

export const getDownloadUrl = async (fileUrl: string, fileName: string): Promise<{ downloadUrl: string }> => {
  const queryParams = new URLSearchParams({
    fileUrl,
    fileName,
  });
  
  const res = await fetch(`${config.apiUrl}/api/messages/download-url?${queryParams}`);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to get download URL');
  }
  
  return data;
};

// export const markMessagesAsRead = async (conversationId: number, userId: string): Promise<void> => {
//   const res = await fetch(`${config.apiUrl}/api/messages/mark-read`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ conversationId, userId }),
//   });
  
//   if (!res.ok) {
//     const data = await res.json();
//     throw new Error(data.error || 'Failed to mark as read');
//   }
// };

// export const sendMessageWithFile = async (
//   senderId: string,
//   recipientId: string,
//   content?: string,
//   file?: File
// ): Promise<void> => {
//   const formData = new FormData();
//   formData.append('senderId', senderId);
//   formData.append('recipientId', recipientId);
//   if (content?.trim()) {
//     formData.append('content', content.trim());
//   }
//   if (file) {
//     formData.append('file', file);
//   }

//   const res = await fetch(`${config.apiUrl}/api/messages/send`, {
//     method: 'POST',
//     body: formData,
//   });

//   if (!res.ok) {
//     const data = await res.json();
//     throw new Error(data.error || 'Failed to send message');
//   }
// };