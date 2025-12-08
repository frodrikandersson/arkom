import { Router } from 'express';
import { db } from '../db/index.js';
import { userCounters } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await db
      .select()
      .from(userCounters)
      .orderBy(desc(userCounters.count))
      .limit(10);
    
    res.json({ leaderboard: topUsers });
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