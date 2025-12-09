import express from 'express';
import { getLeaderboard, getUserCounter, incrementCounter } from '../controllers/counterController.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/:userId', getUserCounter);
router.post('/:userId/increment', incrementCounter);

export default router;