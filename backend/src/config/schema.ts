import { pgTable, serial, text, timestamp, integer, json, boolean } from 'drizzle-orm/pg-core';

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
  themeData: json('theme_data').notNull(), // Full Theme object
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User active theme (stores which theme is currently active, including defaults)
export const userActiveTheme = pgTable('user_active_theme', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  activeThemeId: text('active_theme_id').notNull(), // Can be 'dark', 'light', or custom theme ID
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User settings
export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  timezone: text('timezone').default('UTC').notNull(),
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

// Artworks
export const artworks = pgTable('artworks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(), // '2d', '3d', 'image'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});