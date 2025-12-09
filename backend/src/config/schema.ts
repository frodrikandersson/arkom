import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

// User counter
export const userCounters = pgTable('user_counters', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Your app tables
export const artworks = pgTable('artworks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(), // '2d', '3d', 'image'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});