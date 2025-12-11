import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { userThemes, userActiveTheme } from '../config/schema.js';
import { eq, and } from 'drizzle-orm';

export const getUserActiveTheme = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const [active] = await db.select().from(userActiveTheme).where(eq(userActiveTheme.userId, userId));
    
    res.json({ activeThemeId: active?.activeThemeId || null });
  } catch (error) {
    console.error('Get active theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setUserActiveTheme = async (req: Request, res: Response) => {
  try {
    const { userId, themeId } = req.body;
    
    if (!userId || !themeId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
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
  } catch (error) {
    console.error('Set active theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserThemes = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const themes = await db.select().from(userThemes).where(eq(userThemes.userId, userId));
    
    res.json({ themes });
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTheme = async (req: Request, res: Response) => {
  try {
    const { userId, themeId, themeName, themeData, isActive } = req.body;
    
    if (!userId || !themeId || !themeName || !themeData) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
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
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTheme = async (req: Request, res: Response) => {
  try {
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
      res.status(404).json({ error: 'Theme not found' });
      return;
    }
    
    res.json({ theme });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTheme = async (req: Request, res: Response) => {
  try {
    const { themeId } = req.params;
    
    const [deletedTheme] = await db.delete(userThemes)
      .where(eq(userThemes.themeId, themeId))
      .returning();
    
    if (!deletedTheme) {
      res.status(404).json({ error: 'Theme not found' });
      return;
    }
    
    res.json({ success: true, themeId });
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setActiveTheme = async (req: Request, res: Response) => {
  try {
    const { userId, themeId } = req.body;
    
    if (!userId || !themeId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
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
      res.status(404).json({ error: 'Theme not found' });
      return;
    }
    
    res.json({ theme });
  } catch (error) {
    console.error('Set active theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};