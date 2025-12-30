import express from 'express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markAsRead, 
  getDownloadUrl, 
  getOrCreateConversation,
  hideConversation,
  unhideConversation 
} from '../controllers/messageController.js';
import { upload } from '../config/upload.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All message routes require authentication
router.get('/conversations/:userId', requireAuth, getConversations);
router.get('/download-url', requireAuth, getDownloadUrl);
router.get('/:conversationId', requireAuth, getMessages);
router.post('/send', requireAuth, upload.single('file'), sendMessage);
router.post('/mark-read', requireAuth, markAsRead);
router.post('/get-or-create', requireAuth, getOrCreateConversation);
router.post('/hide', requireAuth, hideConversation);
router.post('/unhide', requireAuth, unhideConversation);

export default router;
