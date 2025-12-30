import express from 'express';
import { getDashboard, getLeaderboard, getUserCounter, incrementCounter } from '../controllers/counterController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard/:userId', getDashboard);
router.get('/leaderboard', getLeaderboard);
router.get('/:userId', getUserCounter);
router.post('/:userId/increment', requireAuth, incrementCounter);

export default router;