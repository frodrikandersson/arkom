import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { conversations, messages, hiddenConversations, blockedUsers, activeConversations, notifications } from '../config/schema.js';
import { eq, or, and, desc, not, sql } from 'drizzle-orm';
import { uploadToR2, getSignedDownloadUrl } from '../config/r2.js';
import { createNotification } from './notificationController.js';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get all conversations for this user
    const userConversations = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.participantOneId, userId),
          eq(conversations.participantTwoId, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));
    
    // Get hidden conversation IDs for this user
    const hiddenConvs = await db
      .select()
      .from(hiddenConversations)
      .where(eq(hiddenConversations.userId, userId));
    
    const hiddenIds = new Set(hiddenConvs.map(hc => hc.conversationId));
    
    // Filter out hidden conversations
    const visibleConversations = userConversations.filter(
      conv => !hiddenIds.has(conv.id)
    );
    
    // For each conversation, get the last message, unread count, and other user's details
    const conversationsWithDetails = await Promise.all(
      visibleConversations.map(async (conv) => {
        const [lastMessage] = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);
        
        const unreadCount = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              eq(messages.isRead, false),
              eq(messages.senderId, conv.participantOneId === userId ? conv.participantTwoId : conv.participantOneId)
            )
          );
        
        const otherUserId = conv.participantOneId === userId ? conv.participantTwoId : conv.participantOneId;
        
        // Fetch other user's details from Stack Auth and user_settings
        const result = await db.execute(sql`
          SELECT 
            u.raw_json->>'id' as id,
            u.raw_json->>'display_name' as stack_display_name,
            u.raw_json->>'profile_image_url' as stack_profile_image,
            s.username as custom_username,
            s.display_name as custom_display_name,
            s.profile_image_url as custom_profile_image
          FROM neon_auth.users_sync u
          LEFT JOIN user_settings s ON u.raw_json->>'id' = s.user_id
          WHERE u.raw_json->>'id' = ${otherUserId}
          LIMIT 1
        `);
        
        const otherUser = result.rows[0] as any;
        
        // Prioritize custom settings over Stack Auth defaults
        const displayName = otherUser?.custom_display_name || 
                           otherUser?.custom_username || 
                           otherUser?.stack_display_name || 
                           'Unknown User';
        
        const profileImage = otherUser?.custom_profile_image || 
                            otherUser?.stack_profile_image || 
                            null;
        
        return {
          conversationId: conv.id,
          otherUserId,
          otherUserName: displayName,
          otherUserUsername: otherUser?.custom_username || otherUserId.slice(0, 8),
          otherUserAvatar: profileImage,
          lastMessage: lastMessage?.content || '',
          lastMessageAt: conv.lastMessageAt,
          unreadCount: unreadCount.length,
        };
      })
    );
    
    res.json({ conversations: conversationsWithDetails });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    
    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, parseInt(conversationId)))
      .orderBy(messages.createdAt);
    
    res.json({ messages: conversationMessages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId, content, messageId } = req.body;
    const file = req.file;
    
  if (!senderId || !recipientId) {
    res.status(400).json({ error: 'Sender and recipient are required' });
    return;
  }

  // Check if messageId is provided
  if (!messageId) {
    res.status(400).json({ error: 'messageId is required' });
    return;
  }

  // Check for duplicate message (idempotency)
  const existingMessage = await db
    .select()
    .from(messages)
    .where(eq(messages.messageId, messageId))
    .limit(1);

  if (existingMessage.length > 0) {
    console.log('Duplicate message detected, returning existing:', messageId);
    res.json({ message: existingMessage[0] });
    return;
  }

  if (!content && !file) {
    res.status(400).json({ error: 'Message content or file is required' });
    return;
  }

    // Check if either user has blocked the other
    const blockCheck = await db
      .select()
      .from(blockedUsers)
      .where(
        or(
          and(
            eq(blockedUsers.userId, senderId),
            eq(blockedUsers.blockedUserId, recipientId)
          ),
          and(
            eq(blockedUsers.userId, recipientId),
            eq(blockedUsers.blockedUserId, senderId)
          )
        )
      );

    if (blockCheck.length > 0) {
      res.status(403).json({ error: 'Cannot send message to this user' });
      return;
    }
    
    // Find or create conversation
    let [conversation] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.participantOneId, senderId),
            eq(conversations.participantTwoId, recipientId)
          ),
          and(
            eq(conversations.participantOneId, recipientId),
            eq(conversations.participantTwoId, senderId)
          )
        )
      );
    
    if (!conversation) {
      [conversation] = await db
        .insert(conversations)
        .values({
          participantOneId: senderId,
          participantTwoId: recipientId,
        })
        .returning();
    }
    
    // Prepare message data
    const messageData: any = {
      messageId,  // Add this
      conversationId: conversation.id,
      senderId,
      content: content || null,
    };

    // Add file data if present
    if (file) {
      const { url, key } = await uploadToR2(file, 'messages');
      messageData.fileUrl = url;
      messageData.fileName = file.originalname;
      messageData.fileType = file.mimetype;
      messageData.fileSize = file.size;
    }
    
    // Create message
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    
    // Update conversation last message time
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversation.id));
    
    // Create notification for recipient
    try {
      console.log('=== MESSAGE NOTIFICATION DEBUG ===');
      console.log('Sender ID:', senderId);
      console.log('Recipient ID:', recipientId);
      console.log('Conversation ID:', conversation.id);
      console.log('New Message ID:', message.id);
      
      // Check 1: Any unread messages before this one?
      const existingUnreadMessages = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversation.id),
            eq(messages.senderId, senderId),
            eq(messages.isRead, false),
            sql`${messages.id} < ${message.id}`
          )
        );

      console.log('Existing unread messages:', existingUnreadMessages.length);

      // Check 2: Is recipient actively viewing this conversation?
      const activeViewing = await db
        .select()
        .from(activeConversations)
        .where(
          and(
            eq(activeConversations.userId, recipientId),
            eq(activeConversations.conversationId, conversation.id),
            sql`${activeConversations.lastActive} > NOW() - INTERVAL '1 minute'`
          )
        );

      console.log('Recipient actively viewing:', activeViewing.length > 0);

      // Check 3: Recent notification sent for this conversation?
      const recentNotifications = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, recipientId),
            eq(notifications.type, 'message'),
            eq(notifications.relatedUserId, senderId),
            sql`${notifications.createdAt} > NOW() - INTERVAL '5 minutes'`
          )
        );

      console.log('Recent notifications:', recentNotifications.length);

      // Smart notification logic:
      // - Always notify on FIRST unread message
      // - Don't notify if user is actively viewing (last activity < 1 min ago)
      // - Don't notify if we sent a notification < 5 minutes ago
      const isFirstUnread = existingUnreadMessages.length === 0;
      const isActivelyViewing = activeViewing.length > 0;
      const hasRecentNotification = recentNotifications.length > 0;

      const shouldNotify = isFirstUnread && !isActivelyViewing && !hasRecentNotification;
      
      console.log('Should notify:', shouldNotify, {
        isFirstUnread,
        isActivelyViewing,
        hasRecentNotification
      });

      if (shouldNotify) {
        console.log('Creating notification for recipient:', recipientId);
        
        // Get sender's name
        const senderResult = await db.execute(sql`
          SELECT 
            u.raw_json->>'display_name' as stack_display_name,
            s.username as custom_username,
            s.display_name as custom_display_name
          FROM neon_auth.users_sync u
          LEFT JOIN user_settings s ON u.raw_json->>'id' = s.user_id
          WHERE u.raw_json->>'id' = ${senderId}
          LIMIT 1
        `);
        
        const sender = senderResult.rows[0] as any;
        const senderName = sender?.custom_display_name || 
                          sender?.custom_username || 
                          sender?.stack_display_name || 
                          'Someone';
        
        const notification = await createNotification(
          recipientId,
          'message',
          `New message from ${senderName}`,
          content 
            ? (content.length > 100 ? content.substring(0, 100) + '...' : content)
            : 'Sent you a file',
          message.id.toString(),
          senderId,
          `/messages?conversation=${conversation.id}`
        );
        
        console.log('Notification created:', notification);
      } else {
        console.log('Skipping notification:', 
          !isFirstUnread ? 'not first unread' : 
          isActivelyViewing ? 'user actively viewing' : 
          'recent notification sent'
        );
      }
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }


    res.json({ message });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { conversationId, userId } = req.body;
    
    if (!conversationId || !userId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    // Mark all unread messages in this conversation that were NOT sent by the current user
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isRead, false),
          // Only mark messages sent by the OTHER person as read
          not(eq(messages.senderId, userId))
        )
      );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDownloadUrl = async (req: Request, res: Response) => {
  try {
    const { fileUrl, fileName } = req.query;
    
    if (!fileUrl || typeof fileUrl !== 'string') {
      res.status(400).json({ error: 'File URL is required' });
      return;
    }
    
    // Extract key from full URL
    const urlObj = new URL(fileUrl);
    const key = urlObj.pathname.substring(1); // Remove leading slash
    
    const signedUrl = await getSignedDownloadUrl(
      key,
      (fileName as string) || 'download',
      300 // 5 minutes
    );
    
    res.json({ downloadUrl: signedUrl });
  } catch (error) {
    console.error('Get download URL error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.body;
    
    if (!userId || !otherUserId) {
      res.status(400).json({ error: 'Both userId and otherUserId are required' });
      return;
    }

    // Find existing conversation
    let [conversation] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.participantOneId, userId),
            eq(conversations.participantTwoId, otherUserId)
          ),
          and(
            eq(conversations.participantOneId, otherUserId),
            eq(conversations.participantTwoId, userId)
          )
        )
      );
    
    // Create new conversation if it doesn't exist
    if (!conversation) {
      [conversation] = await db
        .insert(conversations)
        .values({
          participantOneId: userId,
          participantTwoId: otherUserId,
        })
        .returning();
    }
    
    // If conversation was hidden, unhide it
    await db
      .delete(hiddenConversations)
      .where(
        and(
          eq(hiddenConversations.userId, userId),
          eq(hiddenConversations.conversationId, conversation.id)
        )
      );
    
    res.json({ 
      conversationId: conversation.id,
      otherUserId: conversation.participantOneId === userId 
        ? conversation.participantTwoId 
        : conversation.participantOneId
    });
  } catch (error) {
    console.error('Get or create conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const hideConversation = async (req: Request, res: Response) => {
  try {
    const { userId, conversationId } = req.body;
    
    if (!userId || !conversationId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if already hidden
    const existing = await db
      .select()
      .from(hiddenConversations)
      .where(
        and(
          eq(hiddenConversations.userId, userId),
          eq(hiddenConversations.conversationId, conversationId)
        )
      );

    if (existing.length === 0) {
      // Hide the conversation
      await db.insert(hiddenConversations).values({
        userId,
        conversationId,
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Hide conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unhideConversation = async (req: Request, res: Response) => {
  try {
    const { userId, conversationId } = req.body;
    
    if (!userId || !conversationId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    await db
      .delete(hiddenConversations)
      .where(
        and(
          eq(hiddenConversations.userId, userId),
          eq(hiddenConversations.conversationId, conversationId)
        )
      );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Unhide conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
