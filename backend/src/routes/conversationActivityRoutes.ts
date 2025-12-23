import express from 'express';
import { markConversationActive, markConversationInactive } from '../controllers/conversationActivityController.js';

const router = express.Router();

router.post('/active', markConversationActive);
router.post('/inactive', markConversationInactive);

export default router;
