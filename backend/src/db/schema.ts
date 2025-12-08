import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Example schema - modify as needed
export const artworks = pgTable('artworks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(), // '2d', '3d', 'image'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});