import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { activeConversations } from '../config/schema.js';
import { eq, and, sql } from 'drizzle-orm';

// Mark conversation as actively being viewed
export const markConversationActive = async (req: Request, res: Response) => {
  try {
    const { userId, conversationId } = req.body;
    console.log('Marking conversation active for user:', userId, 'conversation:', conversationId);
    if (!userId || !conversationId) {
      res.status(400).json({ error: 'userId and conversationId required' });
      return;
    }

    // Upsert: Insert or update last_active timestamp
    await db.execute(sql`
      INSERT INTO active_conversations (user_id, conversation_id, last_active)
      VALUES (${userId}, ${conversationId}, NOW())
      ON CONFLICT (user_id, conversation_id)
      DO UPDATE SET last_active = NOW()
    `);

    res.json({ success: true });
  } catch (error) {
    console.error('Mark conversation active error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark conversation as inactive (user closed/left conversation)
export const markConversationInactive = async (req: Request, res: Response) => {
  try {
    const { userId, conversationId } = req.body;
    console.log('Marking conversation inactive for user:', userId, 'conversation:', conversationId);
    if (!userId || !conversationId) {
      res.status(400).json({ error: 'userId and conversationId required' });
      return;
    }

    await db
      .delete(activeConversations)
      .where(
        and(
          eq(activeConversations.userId, userId),
          eq(activeConversations.conversationId, conversationId)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark conversation inactive error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
