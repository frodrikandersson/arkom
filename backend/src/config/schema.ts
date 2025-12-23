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

// Provenance analysis results
export const provenanceAnalysis = pgTable('provenance_analysis', {
  id: serial('id').primaryKey(),
  artworkId: integer('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
  
  // Layer scores (0-100 for easier integer storage, divide by 100 for 0-1 range)
  metadataScore: integer('metadata_score'), // 0-100
  fileAnalysisScore: integer('file_analysis_score'), // 0-100
  visualAiScore: integer('visual_ai_score'), // 0-100
  behavioralScore: integer('behavioral_score'), // 0-100
  communityScore: integer('community_score'), // 0-100
  
  // Combined results
  finalScore: integer('final_score'), // 0-100
  confidenceLevel: text('confidence_level'), // 'low', 'medium', 'high', 'very_high'
  verdict: text('verdict'), // 'likely_legitimate', 'uncertain', 'likely_ai', 'verified_artist'
  
  // Details stored as JSON
  metadataDetails: text('metadata_details'), // JSON string
  behavioralDetails: text('behavioral_details'), // JSON string
  aiDetectionDetails: text('ai_detection_details'), // JSON string
  
  // Status
  isFlagged: boolean('is_flagged').default(false),
  isAppealed: boolean('is_appealed').default(false),
  appealStatus: text('appeal_status'), // 'pending', 'approved', 'rejected', null
});

// Provenance appeals
export const provenanceAppeals = pgTable('provenance_appeals', {
  id: serial('id').primaryKey(),
  analysisId: integer('analysis_id').notNull().references(() => provenanceAnalysis.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  appealText: text('appeal_text').notNull(),
  supportingEvidenceUrl: text('supporting_evidence_url'), // Link to process video, etc.
  status: text('status').default('pending'), // 'pending', 'approved', 'rejected'
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Artist verification
export const artistVerification = pgTable('artist_verification', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  verificationType: text('verification_type'), // 'process_video', 'portfolio_review', 'manual'
  verifiedAt: timestamp('verified_at').defaultNow().notNull(),
  verifiedBy: text('verified_by'),
  verificationEvidence: text('verification_evidence'), // JSON string
  expiresAt: timestamp('expires_at'), // Optional: annual re-verification
});

// Reporter reputation (for community reporting)
export const reporterReputation = pgTable('reporter_reputation', {
  userId: text('user_id').primaryKey(),
  totalReports: integer('total_reports').default(0),
  accurateReports: integer('accurate_reports').default(0),
  falseReports: integer('false_reports').default(0),
  reputationScore: integer('reputation_score').default(50), // 0-100 (50 = neutral start)
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// User upload behavior tracking (aggregated, privacy-friendly)
export const userUploadBehavior = pgTable('user_upload_behavior', {
  userId: text('user_id').primaryKey(),
  totalUploads: integer('total_uploads').default(0),
  uploadsLastHour: integer('uploads_last_hour').default(0),
  uploadsLastDay: integer('uploads_last_day').default(0),
  averageUploadInterval: integer('average_upload_interval'), // seconds
  pasteUploadCount: integer('paste_upload_count').default(0),
  fileUploadCount: integer('file_upload_count').default(0),
  lastUploadAt: timestamp('last_upload_at'),
  suspiciousPatterns: text('suspicious_patterns'), // JSON string
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
