import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { userSettings } from '../config/schema.js';
import { eq, sql } from 'drizzle-orm';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const checkAdminStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  res.json({
    success: true,
    isAdmin: settings?.isAdmin || false,
  });
});

// Get all users (admin only)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;

  // Join user_settings with user_credentials to get email
  const result = await db.execute(sql`
    SELECT
      us.id,
      us.user_id,
      us.username,
      us.display_name,
      us.bio,
      us.location,
      us.profile_image_url,
      us.is_admin,
      us.updated_at,
      uc.email
    FROM user_settings us
    LEFT JOIN user_credentials uc ON us.user_id = uc.user_id
    ORDER BY us.username ASC NULLS LAST
  `);

  let users = result.rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    location: row.location,
    profileImageUrl: row.profile_image_url,
    isAdmin: row.is_admin,
    updatedAt: row.updated_at,
    email: row.email,
  }));

  // Filter by search if provided
  if (search && typeof search === 'string') {
    const searchLower = search.toLowerCase();
    users = users.filter((user: any) => 
      user.username?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.userId.toLowerCase().includes(searchLower)
    );
  }

  res.json({
    success: true,
    users,
  });
});

// Update user admin status (admin only)
export const updateUserAdminStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isAdmin } = req.body;

  if (typeof isAdmin !== 'boolean') {
    throw new AppError(400, 'isAdmin must be a boolean');
  }

  // Prevent self-demotion
  if (req.user?.id === userId && !isAdmin) {
    throw new AppError(403, 'You cannot remove your own admin status');
  }

  const [updated] = await db
    .update(userSettings)
    .set({
      isAdmin,
      updatedAt: new Date(),
    })
    .where(eq(userSettings.userId, userId))
    .returning();

  if (!updated) {
    throw new AppError(404, 'User not found');
  }

  res.json({
    success: true,
    user: updated,
  });
});
