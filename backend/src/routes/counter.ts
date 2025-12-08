import { Router } from 'express';
import { db } from '../db/index.js';
import { userCounters } from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

const router = Router();

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
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
});

// Get counter for user
router.get('/:userId', async (req, res) => {
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
});

// Increment counter for user
router.post('/:userId/increment', async (req, res) => {
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
});

export default router;