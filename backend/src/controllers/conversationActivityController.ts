import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { activeConversations } from '../config/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Mark conversation as actively being viewed
export const markConversationActive = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { conversationId } = req.body;
  
  if (!conversationId) {
    throw new AppError(400, 'conversationId required');
  }

  // Upsert: Insert or update last_active timestamp
  await db.execute(sql`
    INSERT INTO active_conversations (user_id, conversation_id, last_active)
    VALUES (${userId}, ${conversationId}, NOW())
    ON CONFLICT (user_id, conversation_id)
    DO UPDATE SET last_active = NOW()
  `);

  res.json({ success: true });
});

// Mark conversation as inactive (user closed/left conversation)
export const markConversationInactive = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { conversationId } = req.body;
  
  if (!conversationId) {
    throw new AppError(400, 'conversationId required');
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
});
