import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { userCounters } from '../config/schema.js';
import { eq, sql } from 'drizzle-orm';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const topUsers = await db.execute(sql`
      SELECT 
        uc.user_id,
        uc.count,
        u.raw_json->>'display_name' as display_name,
        u.raw_json->>'primary_email' as primary_email
      FROM user_counters uc
      LEFT JOIN neon_auth.users_sync u ON uc.user_id = u.raw_json->>'id'
      ORDER BY uc.count DESC
      LIMIT 10
    `);
    
    res.json({ leaderboard: topUsers.rows });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserCounter = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    let [counter] = await db.select().from(userCounters).where(eq(userCounters.userId, userId));
    
    if (!counter) {
      [counter] = await db.insert(userCounters).values({
        userId,
        count: 0,
      }).returning();
    }
    
    res.json({ count: counter.count });
  } catch (error) {
    console.error('Get counter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const incrementCounter = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    let [counter] = await db.select().from(userCounters).where(eq(userCounters.userId, userId));
    
    if (!counter) {
      [counter] = await db.insert(userCounters).values({
        userId,
        count: 1,
      }).returning();
    } else {
      [counter] = await db.update(userCounters)
        .set({ 
          count: counter.count + 1,
          updatedAt: new Date(),
        })
        .where(eq(userCounters.userId, userId))
        .returning();
    }
    
    res.json({ count: counter.count });
  } catch (error) {
    console.error('Increment counter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};