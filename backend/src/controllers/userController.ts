import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { userSettings } from '../config/schema.js';
import { eq } from 'drizzle-orm';

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
    const { timezone } = req.body;
    
    if (!timezone) {
      res.status(400).json({ error: 'Timezone is required' });
      return;
    }
    
    // Check if settings exist
    const [existing] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    
    let settings;
    if (existing) {
      [settings] = await db
        .update(userSettings)
        .set({ timezone, updatedAt: new Date() })
        .where(eq(userSettings.userId, userId))
        .returning();
    } else {
      [settings] = await db
        .insert(userSettings)
        .values({ userId, timezone })
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
    
    if (!query || query.length < 2) {
      res.json({ users: [] });
      return;
    }

    // TODO: Replace with actual Stack Auth user search
    // For now, return mock data or integrate with your user system
    const users = [
      { id: 'user1', displayName: 'John Doe', profileImageUrl: null },
      { id: 'user2', displayName: 'Jane Smith', profileImageUrl: null },
    ].filter(u => u.displayName.toLowerCase().includes(query.toLowerCase()));

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // TODO: Replace with actual Stack Auth user lookup
    // For now, return mock profile
    const profile = {
      id: userId,
      displayName: `User ${userId}`,
      profileImageUrl: null,
      bio: 'Artist and creator',
    };

    res.json({ profile });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};