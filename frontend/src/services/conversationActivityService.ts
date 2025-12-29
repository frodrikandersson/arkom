import { api } from '../utils/apiClient';

export const markConversationActive = async (userId: string, conversationId: number): Promise<void> => {
  try {
    await api.post<void>('/api/conversation-activity/active', { userId, conversationId });
  } catch (error) {
    console.error('Failed to mark conversation active:', error);
  }
};

export const markConversationInactive = async (userId: string, conversationId: number): Promise<void> => {
  try {
    await api.post<void>('/api/conversation-activity/inactive', { userId, conversationId });
  } catch (error) {
    console.error('Failed to mark conversation inactive:', error);
  }
};
