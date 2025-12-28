import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { userSettings, blockedUsers, userReports } from '../config/schema.js';
import { eq, sql, and, or } from 'drizzle-orm';
import { uploadToR2 } from '../config/r2.js';


export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
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
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
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
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const searchUsers = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const currentUserId = req.query.userId as string;
    
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

    // Search users from neon_auth.users_sync with LEFT JOIN to user_settings
    const result = await db.execute(sql`
      SELECT 
        u.raw_json->>'id' as id,
        u.raw_json->>'display_name' as stack_display_name,
        u.raw_json->>'profile_image_url' as stack_profile_image,
        u.raw_json->>'primary_email' as primary_email,
        s.username as custom_username,
        s.display_name as custom_display_name,
        s.profile_image_url as custom_profile_image
      FROM neon_auth.users_sync u
      LEFT JOIN user_settings s ON u.raw_json->>'id' = s.user_id
      WHERE 
        LOWER(u.raw_json->>'display_name') LIKE LOWER(${'%' + query + '%'})
        OR LOWER(u.raw_json->>'primary_email') LIKE LOWER(${'%' + query + '%'})
        OR LOWER(u.raw_json->>'id') LIKE LOWER(${'%' + query + '%'})
        OR LOWER(s.username) LIKE LOWER(${'%' + query + '%'})
        OR LOWER(s.display_name) LIKE LOWER(${'%' + query + '%'})
      LIMIT 20
    `);

    // Filter out blocked users and map results
    const users = result.rows
      .filter((row: any) => !blockedUserIds.includes(row.id))
      .slice(0, 10)
      .map((row: any) => ({
        id: row.id,
        username: row.custom_username,
        displayName: row.custom_display_name || row.stack_display_name || row.primary_email,
        profileImageUrl: row.custom_profile_image || row.stack_profile_image,
      }));

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Fetch user from neon_auth.users_sync table
    const result = await db.execute(sql`
      SELECT 
        raw_json->>'id' as id,
        raw_json->>'display_name' as display_name,
        raw_json->>'profile_image_url' as profile_image_url,
        raw_json->>'primary_email' as primary_email
      FROM neon_auth.users_sync
      WHERE raw_json->>'id' = ${userId}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0] as any;
    
    // Get user settings (custom profile data)
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    // Get portfolio count (published only)
    const portfolioCount = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM portfolios
      WHERE user_id = ${userId} AND status = 'published'
    `);

    const profile = {
      id: user.id,
      username: settings?.username || null,
      displayName: settings?.displayName || user.display_name || user.primary_email,
      profileImageUrl: settings?.profileImageUrl || user.profile_image_url,
      bannerImageUrl: settings?.bannerImageUrl || null,
      bio: settings?.bio || null,
      location: settings?.location || null,
      socialLinks: settings?.socialLinks || null,
      portfolioCount: parseInt(portfolioCount.rows[0]?.count as string || '0'),
      memberSince: settings?.updatedAt || new Date(),
    };


    res.json({ profile });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const blockUser = async (req: Request, res: Response) => {
  try {
    const { userId, blockedUserId, reason } = req.body;
    
    if (!userId || !blockedUserId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (userId === blockedUserId) {
      res.status(400).json({ error: 'Cannot block yourself' });
      return;
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
      res.status(400).json({ error: 'User already blocked' });
      return;
    }

    // Block the user
    await db.insert(blockedUsers).values({
      userId,
      blockedUserId,
      reason: reason || null,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const { userId, blockedUserId } = req.body;
    
    if (!userId || !blockedUserId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
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
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBlockedUsers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const blocked = await db
      .select()
      .from(blockedUsers)
      .where(eq(blockedUsers.userId, userId));
    
    res.json({ blockedUsers: blocked });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkIfBlocked = async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.query;
    
    if (!userId || !otherUserId) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const blocked = await db
      .select()
      .from(blockedUsers)
      .where(
        or(
          and(
            eq(blockedUsers.userId, userId as string),
            eq(blockedUsers.blockedUserId, otherUserId as string)
          ),
          and(
            eq(blockedUsers.userId, otherUserId as string),
            eq(blockedUsers.blockedUserId, userId as string)
          )
        )
      );
    
    res.json({ 
      isBlocked: blocked.length > 0,
      blockedByMe: blocked.some(b => b.userId === userId),
      blockedByThem: blocked.some(b => b.userId === otherUserId)
    });
  } catch (error) {
    console.error('Check if blocked error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reportUser = async (req: Request, res: Response) => {
  try {
    const { reporterId, reportedUserId, reportType, description, conversationId, messageId } = req.body;
    
    if (!reporterId || !reportedUserId || !reportType) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (reporterId === reportedUserId) {
      res.status(400).json({ error: 'Cannot report yourself' });
      return;
    }

    const validTypes = ['spam', 'harassment', 'inappropriate', 'scam', 'other'];
    if (!validTypes.includes(reportType)) {
      res.status(400).json({ error: 'Invalid report type' });
      return;
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
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { username, displayName, bio, location, socialLinks } = req.body;
    
    // Validate username (alphanumeric, underscores, hyphens only, 3-20 chars)
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(username)) {
        res.status(400).json({ 
          error: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens' 
        });
        return;
      }

      // Check if username is already taken
      const existingUsername = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.username, username));
      
      if (existingUsername.length > 0 && existingUsername[0].userId !== userId) {
        res.status(400).json({ error: 'Username already taken' });
        return;
      }
    }
    
    // Validate bio length
    if (bio && bio.length > 500) {
      res.status(400).json({ error: 'Bio must be 500 characters or less' });
      return;
    }

    // Validate social links structure
    if (socialLinks && typeof socialLinks !== 'object') {
      res.status(400).json({ error: 'Invalid social links format' });
      return;
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
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Validate file type (images only)
    if (!file.mimetype.startsWith('image/')) {
      res.status(400).json({ error: 'Only image files are allowed' });
      return;
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
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadBannerImage = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Validate file type (images only)
    if (!file.mimetype.startsWith('image/')) {
      res.status(400).json({ error: 'Only image files are allowed' });
      return;
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
  } catch (error) {
    console.error('Upload banner image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
