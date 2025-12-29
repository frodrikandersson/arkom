import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { userThemes, userActiveTheme } from '../config/schema.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getUserActiveTheme = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const [active] = await db.select().from(userActiveTheme).where(eq(userActiveTheme.userId, userId));
  
  res.json({ activeThemeId: active?.activeThemeId || null });
});

export const setUserActiveTheme = asyncHandler(async (req: Request, res: Response) => {
  const { userId, themeId } = req.body;
  
  if (!userId || !themeId) {
    throw new AppError(400, 'Missing required fields');
  }

  // Upsert active theme
  const [existing] = await db.select().from(userActiveTheme).where(eq(userActiveTheme.userId, userId));
  
  if (existing) {
    await db.update(userActiveTheme)
      .set({ activeThemeId: themeId, updatedAt: new Date() })
      .where(eq(userActiveTheme.userId, userId));
  } else {
    await db.insert(userActiveTheme).values({
      userId,
      activeThemeId: themeId,
    });
  }
  
  res.json({ activeThemeId: themeId });
});

export const getUserThemes = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const themes = await db.select().from(userThemes).where(eq(userThemes.userId, userId));
  
  res.json({ themes });
});

export const createTheme = asyncHandler(async (req: Request, res: Response) => {
  const { userId, themeId, themeName, themeData, isActive } = req.body;
  
  if (!userId || !themeId || !themeName || !themeData) {
    throw new AppError(400, 'Missing required fields');
  }

  // If setting as active, deactivate all other themes for this user
  if (isActive) {
    await db.update(userThemes)
      .set({ isActive: false })
      .where(eq(userThemes.userId, userId));
  }

  const [theme] = await db.insert(userThemes).values({
    userId,
    themeId,
    themeName,
    themeData,
    isActive: isActive || false,
  }).returning();
  
  res.json({ theme });
});

export const updateTheme = asyncHandler(async (req: Request, res: Response) => {
  const { themeId } = req.params;
  const { themeName, themeData, isActive } = req.body;
  
  const updateData: any = { updatedAt: new Date() };
  if (themeName !== undefined) updateData.themeName = themeName;
  if (themeData !== undefined) updateData.themeData = themeData;
  if (isActive !== undefined) {
    updateData.isActive = isActive;
    
    // If setting as active, deactivate all other themes for this user
    if (isActive) {
      const [theme] = await db.select().from(userThemes).where(eq(userThemes.themeId, themeId));
      if (theme) {
        await db.update(userThemes)
          .set({ isActive: false })
          .where(and(
            eq(userThemes.userId, theme.userId),
            eq(userThemes.isActive, true)
          ));
      }
    }
  }

  const [theme] = await db.update(userThemes)
    .set(updateData)
    .where(eq(userThemes.themeId, themeId))
    .returning();
  
  if (!theme) {
    throw new AppError(404, 'Theme not found');
  }
  
  res.json({ theme });
});

export const deleteTheme = asyncHandler(async (req: Request, res: Response) => {
  const { themeId } = req.params;
  
  const [deletedTheme] = await db.delete(userThemes)
    .where(eq(userThemes.themeId, themeId))
    .returning();
  
  if (!deletedTheme) {
    throw new AppError(404, 'Theme not found');
  }
  
  res.json({ success: true, themeId });
});

export const setActiveTheme = asyncHandler(async (req: Request, res: Response) => {
  const { userId, themeId } = req.body;
  
  if (!userId || !themeId) {
    throw new AppError(400, 'Missing required fields');
  }

  // Deactivate all themes for this user
  await db.update(userThemes)
    .set({ isActive: false })
    .where(eq(userThemes.userId, userId));

  // Activate the selected theme
  const [theme] = await db.update(userThemes)
    .set({ isActive: true })
    .where(and(
      eq(userThemes.userId, userId),
      eq(userThemes.themeId, themeId)
    ))
    .returning();
  
  if (!theme) {
    throw new AppError(404, 'Theme not found');
  }
  
  res.json({ theme });
});