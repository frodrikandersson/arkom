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

// Artworks
export const artworks = pgTable('artworks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(), // '2d', '3d', 'image'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});