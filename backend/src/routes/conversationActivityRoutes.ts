import express from 'express';
import { markConversationActive, markConversationInactive } from '../controllers/conversationActivityController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/active', requireAuth, markConversationActive);
router.post('/inactive', requireAuth, markConversationInactive);

export default router;
