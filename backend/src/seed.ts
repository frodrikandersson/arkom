import { db } from './config/db.js';
import { conversations, messages } from './config/schema.js';

const userId1 = '31c0905b-d528-4207-8a38-cd9ee3c7b802';
const userId2 = '3217140f-cc7e-4d47-b576-8a4d5cea67fa';

async function seed() {
  try {
    console.log('Seeding test conversation...');

    // Create conversation
    const [conversation] = await db.insert(conversations).values({
      participantOneId: userId1,
      participantTwoId: userId2,
      lastMessageAt: new Date(),
    }).returning();

    console.log('Created conversation:', conversation.id);

    // Create test messages
    await db.insert(messages).values([
      {
        conversationId: conversation.id,
        senderId: userId1,
        content: 'Hey! How are you doing?',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        conversationId: conversation.id,
        senderId: userId2,
        content: 'I\'m good! Working on some new artwork. What about you?',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
      {
        conversationId: conversation.id,
        senderId: userId1,
        content: 'That sounds exciting! I\'d love to see it when you\'re done.',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      },
      {
        conversationId: conversation.id,
        senderId: userId2,
        content: 'Sure! I\'ll send you some previews soon 🎨',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
      },
    ]);

    console.log('Created 4 test messages');
    console.log('✅ Seed completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();