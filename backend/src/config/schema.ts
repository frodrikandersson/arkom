import { pgTable, serial, text, timestamp, integer, json, boolean, unique, index } from 'drizzle-orm/pg-core';

// User counter
export const userCounters = pgTable('user_counters', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User themes
export const userThemes = pgTable('user_themes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  themeId: text('theme_id').notNull().unique(),
  themeName: text('theme_name').notNull(),
  themeData: json('theme_data').notNull(),
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User active theme
export const userActiveTheme = pgTable('user_active_theme', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  activeThemeId: text('active_theme_id').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User settings (extended with profile fields)
export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  username: text('username').unique(), // Custom username (must be unique)
  timezone: text('timezone').default('UTC').notNull(),
  displayName: text('display_name'),
  bio: text('bio'),
  location: text('location'),
  profileImageUrl: text('profile_image_url'),
  bannerImageUrl: text('banner_image_url'),
  socialLinks: json('social_links'),
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});



// Conversations
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  participantOneId: text('participant_one_id').notNull(),
  participantTwoId: text('participant_two_id').notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Messages
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  messageId: text('message_id').notNull().unique(),
  conversationId: integer('conversation_id').notNull(),
  senderId: text('sender_id').notNull(),
  content: text('content'),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


// Hidden conversations
export const hiddenConversations = pgTable('hidden_conversations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  conversationId: integer('conversation_id').notNull(),
  hiddenAt: timestamp('hidden_at').defaultNow().notNull(),
});

// Blocked users
export const blockedUsers = pgTable('blocked_users', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  blockedUserId: text('blocked_user_id').notNull(),
  reason: text('reason'),
  blockedAt: timestamp('blocked_at').defaultNow().notNull(),
});

// User reports
export const userReports = pgTable('user_reports', {
  id: serial('id').primaryKey(),
  reporterId: text('reporter_id').notNull(),
  reportedUserId: text('reported_user_id').notNull(),
  reportType: text('report_type').notNull(),
  description: text('description'),
  conversationId: integer('conversation_id'),
  messageId: integer('message_id'),
  status: text('status').default('pending').notNull(),
  reportedAt: timestamp('reported_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: text('reviewed_by'),
  actionTaken: text('action_taken'),
});

// Artworks
export const artworks = pgTable('artworks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  fileType: text('file_type').notNull(), // '2d', '3d', 'image'
  tags: json('tags'), // Array of tags for categorization
  isPublic: boolean('is_public').default(true),
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // User receiving the notification
  type: text('type').notNull(), // 'message', 'like', 'comment', 'follow', etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedId: text('related_id'), // ID of related entity (message id, artwork id, etc.)
  relatedUserId: text('related_user_id'), // User who triggered the notification
  actionUrl: text('action_url'), // URL to navigate to when clicked
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Push notification subscriptions
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Active conversation tracking (to prevent notifications when user is viewing)
export const activeConversations = pgTable('active_conversations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  lastActive: timestamp('last_active').notNull().defaultNow(),
}, (table) => ({
  // Unique constraint: one active session per user per conversation
  uniqueUserConversation: unique().on(table.userId, table.conversationId),
  // Index for fast lookups
  userConvIdx: index('active_conv_user_conv_idx').on(table.userId, table.conversationId),
}));
