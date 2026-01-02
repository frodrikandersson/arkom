import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { userSettings } from '../config/schema.js';
import { eq } from 'drizzle-orm';
import { asyncHandler } from '../utils/asyncHandler.js';

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
