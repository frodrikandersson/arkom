import express from 'express';
import { getDashboard, getLeaderboard, getUserCounter, incrementCounter } from '../controllers/counterController.js';

const router = express.Router();

router.get('/dashboard/:userId', getDashboard);
router.get('/leaderboard', getLeaderboard);
router.get('/:userId', getUserCounter);
router.post('/:userId/increment', incrementCounter);

export default router;