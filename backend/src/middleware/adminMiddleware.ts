// backend/src/middleware/adminAuth.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db.js';
import { userSettings } from '../config/schema.js';
import { eq } from 'drizzle-orm';
import { AppError } from './errorMiddleware.js';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    // Check if user is admin
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, req.user.id))
      .limit(1);

    if (!settings || !settings.isAdmin) {
      throw new AppError(403, 'Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
