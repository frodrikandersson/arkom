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
  emailNotifications: boolean('email_notifications').default(false),
  pushNotifications: boolean('push_notifications').default(false),
  isAdmin: boolean('is_admin').default(false).notNull(),
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

// ============================================
// PORTFOLIO SYSTEM
// ============================================

// Commission Services (placeholder - will be expanded later)
export const commissionServices = pgTable('commission_services', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  serviceName: text('service_name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Portfolios (replaces artworks)
export const portfolios = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  
  // Status
  status: text('status').notNull().default('draft'), // 'draft' or 'published'
  
  // Commission link
  linkedToCommission: boolean('linked_to_commission').default(false),
  commissionServiceId: integer('commission_service_id').references(() => commissionServices.id, { onDelete: 'set null' }),
  
  // Sensitive content
  hasSensitiveContent: boolean('has_sensitive_content').default(false),
  
  // Portfolio details
  title: text('title').notNull(),
  description: text('description'),
  tags: json('tags'), // Array of tags for searching
  
  // Stats
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'), // Only set when status changes to 'published'
}, (table) => ({
  // Index for faster queries
  userIdIdx: index('portfolios_user_id_idx').on(table.userId),
  statusIdx: index('portfolios_status_idx').on(table.status),
}));

// Portfolio Media (multiple images/videos per portfolio)
export const portfolioMedia = pgTable('portfolio_media', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  
  // Media details
  mediaType: text('media_type').notNull(), // 'image' or 'youtube'
  
  // For images: fileUrl, thumbnailUrl, fileSize
  fileUrl: text('file_url'), // S3/Storage URL for images
  thumbnailUrl: text('thumbnail_url'), // Thumbnail for images
  fileSize: integer('file_size'), // In bytes, max 8MB (8388608 bytes)
  mimeType: text('mime_type'), // 'image/jpeg', 'image/png', 'image/gif', 'image/webp'
  
  // For YouTube: youtubeUrl, youtubeVideoId
  youtubeUrl: text('youtube_url'), // Full YouTube URL
  youtubeVideoId: text('youtube_video_id'), // Extracted video ID (e.g., 'dQw4w9WgXcQ')
  
  // Sorting order (0 = first to display)
  sortOrder: integer('sort_order').notNull().default(0),
  
  // Sensitive content (media-level) - NEW FIELD
  hasSensitiveContent: boolean('has_sensitive_content').default(false).notNull(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Index for faster queries
  portfolioIdIdx: index('portfolio_media_portfolio_id_idx').on(table.portfolioId),
  sortOrderIdx: index('portfolio_media_sort_order_idx').on(table.portfolioId, table.sortOrder),
}));

// Sensitive Content Types (reference data)
export const sensitiveContentTypes = pgTable('sensitive_content_types', {
  id: serial('id').primaryKey(),
  type: text('type').notNull().unique(), // 'gore', 'sexual_nudity_18+', 'other'
  displayName: text('display_name').notNull(), // 'Gore', 'Sexual/Nudity (18+)', 'Other'
  description: text('description'), // Optional description for what falls under this category
});

// Portfolio Sensitive Content (junction table - many-to-many)
export const portfolioSensitiveContent = pgTable('portfolio_sensitive_content', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  contentTypeId: integer('content_type_id').notNull().references(() => sensitiveContentTypes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: prevent duplicate content type assignments
  uniquePortfolioContentType: unique().on(table.portfolioId, table.contentTypeId),
  // Index for faster queries
  portfolioIdIdx: index('portfolio_sensitive_content_portfolio_id_idx').on(table.portfolioId),
}));

// Portfolio Media Sensitive Content (junction table - many-to-many for media-level)
export const portfolioMediaSensitiveContent = pgTable('portfolio_media_sensitive_content', {
  id: serial('id').primaryKey(),
  mediaId: integer('media_id').notNull().references(() => portfolioMedia.id, { onDelete: 'cascade' }),
  contentTypeId: integer('content_type_id').notNull().references(() => sensitiveContentTypes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: prevent duplicate content type assignments
  uniqueMediaContentType: unique().on(table.mediaId, table.contentTypeId),
  // Index for faster queries
  mediaIdIdx: index('portfolio_media_sensitive_content_media_id_idx').on(table.mediaId),
}));

// Service categories
export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('service_categories_user_id_idx').on(table.userId),
}));

// Services (individual services within categories)
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  categoryId: integer('category_id').references(() => serviceCategories.id, { onDelete: 'cascade' }),
  
  // Service details
  title: text('title').notNull(),
  description: text('description'),
  
  // Pricing
  basePrice: integer('base_price').notNull(), // In cents
  currency: text('currency').notNull().default('USD'),
  
  // Status
  isActive: boolean('is_active').default(true),
  
  // Stats
  orderCount: integer('order_count').default(0),
  
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('services_user_id_idx').on(table.userId),
  categoryIdIdx: index('services_category_id_idx').on(table.categoryId),
}));

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
  portfolioId: integer('portfolio_id'), // Optional - admin can manually link when needed
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

// Add to backend/src/config/schema.ts

// Main catalogues (top level)
export const catalogues = pgTable('catalogues', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories (under catalogues)
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  catalogueId: integer('catalogue_id').notNull().references(() => catalogues.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  catalogueIdIdx: index('categories_catalogue_id_idx').on(table.catalogueId),
}));

// Sub-category filters (applies to all categories)
export const subCategoryFilters = pgTable('sub_category_filters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g., "Subject", "Type"
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sub-category filter options (the actual choices for each filter)
export const subCategoryFilterOptions = pgTable('sub_category_filter_options', {
  id: serial('id').primaryKey(),
  filterId: integer('filter_id').notNull().references(() => subCategoryFilters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Human", "Anthro / Furry"
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  filterIdIdx: index('sub_category_filter_options_filter_id_idx').on(table.filterId),
}));

// Service search categories (what users select for their services)
export const serviceSearchCategories = pgTable('service_search_categories', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  catalogueId: integer('catalogue_id').notNull().references(() => catalogues.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  isDiscoverable: boolean('is_discoverable').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  serviceIdIdx: index('service_search_categories_service_id_idx').on(table.serviceId),
}));

// Service sub-category selections (the filters users select)
export const serviceSubCategorySelections = pgTable('service_sub_category_selections', {
  id: serial('id').primaryKey(),
  serviceSearchCategoryId: integer('service_search_category_id').notNull().references(() => serviceSearchCategories.id, { onDelete: 'cascade' }),
  filterOptionId: integer('filter_option_id').notNull().references(() => subCategoryFilterOptions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  serviceSearchCategoryIdIdx: index('service_sub_category_selections_service_search_category_id_idx').on(table.serviceSearchCategoryId),
}));
