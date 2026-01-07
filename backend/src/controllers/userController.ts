import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { userSettings, blockedUsers, userReports } from '../config/schema.js';
import { eq, sql, and, or } from 'drizzle-orm';
import { uploadToR2 } from '../config/r2.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getUserSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  
  let [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));
  
  if (!settings) {
    // Create default settings
    [settings] = await db
      .insert(userSettings)
      .values({ userId, timezone: 'UTC' })
      .returning();
  }
  
  res.json(settings);
});

export const updateUserSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const updateData = req.body;
  
  // Validate that at least one field is being updated
  if (Object.keys(updateData).length === 0) {
    throw new AppError(400, 'No fields to update');
  }
  
  // Check if settings exist
  const [existing] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));
  
  let settings;
  if (existing) {
    // Update existing settings
    [settings] = await db
      .update(userSettings)
      .set({ 
        ...updateData, 
        updatedAt: new Date() 
      })
      .where(eq(userSettings.userId, userId))
      .returning();
  } else {
    // Create new settings with provided data
    [settings] = await db
      .insert(userSettings)
      .values({ 
        userId, 
        timezone: 'UTC', // default timezone
        ...updateData 
      })
      .returning();
  }
  
  res.json(settings);
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const currentUserId = req.user?.id; // Optional auth - may be undefined
  
  if (!query || query.length < 2) {
    res.json({ users: [] });
    return;
  }

  // Get blocked user IDs for current user
  let blockedUserIds: string[] = [];
  if (currentUserId) {
    const blocked = await db
      .select()
      .from(blockedUsers)
      .where(eq(blockedUsers.userId, currentUserId));
    blockedUserIds = blocked.map(b => b.blockedUserId);
  }

  // Search users from user_settings
  const result = await db.execute(sql`
    SELECT
      user_id as id,
      username,
      display_name,
      profile_image_url
    FROM user_settings
    WHERE
      LOWER(username) LIKE LOWER(${'%' + query + '%'})
      OR LOWER(display_name) LIKE LOWER(${'%' + query + '%'})
      OR LOWER(user_id) LIKE LOWER(${'%' + query + '%'})
    LIMIT 20
  `);

  // Filter out blocked users and map results
  const users = result.rows
    .filter((row: any) => !blockedUserIds.includes(row.id))
    .slice(0, 10)
    .map((row: any) => ({
      id: row.id,
      username: row.username,
      displayName: row.display_name || row.username || 'User',
      profileImageUrl: row.profile_image_url,
    }));

  res.json({ users });
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Get user settings (primary source for custom auth users)
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  if (!settings) {
    throw new AppError(404, 'User not found');
  }

  // Get portfolio count (published only)
  const portfolioCount = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM portfolios
    WHERE user_id = ${userId} AND status = 'published'
  `);

  const profile = {
    id: userId,
    username: settings.username || null,
    displayName: settings.displayName || null,
    profileImageUrl: settings.profileImageUrl || null,
    bannerImageUrl: settings.bannerImageUrl || null,
    bio: settings.bio || null,
    location: settings.location || null,
    socialLinks: settings.socialLinks || null,
    portfolioCount: parseInt(portfolioCount.rows[0]?.count as string || '0'),
    memberSince: settings.updatedAt || new Date(),
  };

  res.json({ profile });
});

export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { blockedUserId, reason } = req.body;
  
  if (!blockedUserId) {
    throw new AppError(400, 'Missing required fields');
  }

  if (userId === blockedUserId) {
    throw new AppError(400, 'Cannot block yourself');
  }

  // Check if already blocked
  const existing = await db
    .select()
    .from(blockedUsers)
    .where(
      and(
        eq(blockedUsers.userId, userId),
        eq(blockedUsers.blockedUserId, blockedUserId)
      )
    );

  if (existing.length > 0) {
    throw new AppError(400, 'User already blocked');
  }

  // Block the user
  await db.insert(blockedUsers).values({
    userId,
    blockedUserId,
    reason: reason || null,
  });
  
  res.json({ success: true });
});

export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { blockedUserId } = req.body;
  
  if (!blockedUserId) {
    throw new AppError(400, 'Missing required fields');
  }

  await db
    .delete(blockedUsers)
    .where(
      and(
        eq(blockedUsers.userId, userId),
        eq(blockedUsers.blockedUserId, blockedUserId)
      )
    );
  
  res.json({ success: true });
});

export const getBlockedUsers = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  
  const blocked = await db
    .select()
    .from(blockedUsers)
    .where(eq(blockedUsers.userId, userId));
  
  res.json({ blockedUsers: blocked });
});

export const checkIfBlocked = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id; // Optional auth
  const { otherUserId } = req.query;
  
  if (!otherUserId) {
    throw new AppError(400, 'Missing required parameters');
  }

  // If no authenticated user, not blocked
  if (!userId) {
    res.json({ 
      isBlocked: false,
      blockedByMe: false,
      blockedByThem: false
    });
    return;
  }

  const blocked = await db
    .select()
    .from(blockedUsers)
    .where(
      or(
        and(
          eq(blockedUsers.userId, userId),
          eq(blockedUsers.blockedUserId, otherUserId as string)
        ),
        and(
          eq(blockedUsers.userId, otherUserId as string),
          eq(blockedUsers.blockedUserId, userId)
        )
      )
    );
  
  res.json({ 
    isBlocked: blocked.length > 0,
    blockedByMe: blocked.some(b => b.userId === userId),
    blockedByThem: blocked.some(b => b.userId === otherUserId)
  });
});

export const reportUser = asyncHandler(async (req: Request, res: Response) => {
  const reporterId = req.user!.id;
  const { reportedUserId, reportType, description, conversationId, messageId } = req.body;
  
  if (!reportedUserId || !reportType) {
    throw new AppError(400, 'Missing required fields');
  }

  if (reporterId === reportedUserId) {
    throw new AppError(400, 'Cannot report yourself');
  }

  const validTypes = ['spam', 'harassment', 'inappropriate', 'scam', 'other'];
  if (!validTypes.includes(reportType)) {
    throw new AppError(400, 'Invalid report type');
  }

  // Create the report
  const [report] = await db.insert(userReports).values({
    reporterId,
    reportedUserId,
    reportType,
    description: description || null,
    conversationId: conversationId || null,
    messageId: messageId || null,
  }).returning();
  
  res.json({ success: true, reportId: report.id });
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { username, displayName, bio, location, socialLinks } = req.body;
  
  // Validate username (alphanumeric, underscores, hyphens only, 3-20 chars)
  if (username) {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      throw new AppError(400, 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens');
    }

    // Check if username is already taken
    const existingUsername = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.username, username));
    
    if (existingUsername.length > 0 && existingUsername[0].userId !== userId) {
      throw new AppError(400, 'Username already taken');
    }
  }
  
  // Validate bio length
  if (bio && bio.length > 500) {
    throw new AppError(400, 'Bio must be 500 characters or less');
  }

  // Validate social links structure
  if (socialLinks && typeof socialLinks !== 'object') {
    throw new AppError(400, 'Invalid social links format');
  }

  // Get existing settings
  let [existing] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  const updateData: any = {
    username: username || null,
    displayName: displayName || null,
    bio: bio || null,
    location: location || null,
    socialLinks: socialLinks || null,
    updatedAt: new Date(),
  };

  let settings;
  if (existing) {
    [settings] = await db
      .update(userSettings)
      .set(updateData)
      .where(eq(userSettings.userId, userId))
      .returning();
  } else {
    [settings] = await db
      .insert(userSettings)
      .values({
        userId,
        timezone: 'UTC',
        ...updateData,
      })
      .returning();
  }

  res.json(settings);
});

export const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const file = req.file;

  if (!file) {
    throw new AppError(400, 'No file uploaded');
  }

  // Validate file type (images only)
  if (!file.mimetype.startsWith('image/')) {
    throw new AppError(400, 'Only image files are allowed');
  }

  // Upload to R2
  const { url } = await uploadToR2(file, 'profile-images');

  // Update user settings
  let [existing] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  let settings;
  if (existing) {
    [settings] = await db
      .update(userSettings)
      .set({ 
        profileImageUrl: url,
        updatedAt: new Date()
      })
      .where(eq(userSettings.userId, userId))
      .returning();
  } else {
    [settings] = await db
      .insert(userSettings)
      .values({
        userId,
        timezone: 'UTC',
        profileImageUrl: url,
      })
      .returning();
  }

  res.json({ profileImageUrl: url, settings });
});

export const uploadBannerImage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const file = req.file;

  if (!file) {
    throw new AppError(400, 'No file uploaded');
  }

  // Validate file type (images only)
  if (!file.mimetype.startsWith('image/')) {
    throw new AppError(400, 'Only image files are allowed');
  }

  // Upload to R2
  const { url } = await uploadToR2(file, 'banner-images');

  // Update user settings
  let [existing] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  let settings;
  if (existing) {
    [settings] = await db
      .update(userSettings)
      .set({ 
        bannerImageUrl: url,
        updatedAt: new Date()
      })
      .where(eq(userSettings.userId, userId))
      .returning();
  } else {
    [settings] = await db
      .insert(userSettings)
      .values({
        userId,
        timezone: 'UTC',
        bannerImageUrl: url,
      })
      .returning();
  }

  res.json({ bannerImageUrl: url, settings });
});

