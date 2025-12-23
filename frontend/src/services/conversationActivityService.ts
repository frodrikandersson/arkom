import { config } from '../config/env';

export const markConversationActive = async (userId: string, conversationId: number): Promise<void> => {
  try {
    console.log('Marking conversation active for user:', userId, 'conversation:', conversationId);
    await fetch(`${config.apiUrl}/api/conversation-activity/active`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, conversationId }),
    });
  } catch (error) {
    console.error('Failed to mark conversation active:', error);
  }
};

export const markConversationInactive = async (userId: string, conversationId: number): Promise<void> => {
  try {
    console.log('Marking conversation inactive for user:', userId, 'conversation:', conversationId);
    await fetch(`${config.apiUrl}/api/conversation-activity/inactive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, conversationId }),
    });
  } catch (error) {
    console.error('Failed to mark conversation inactive:', error);
  }
};
