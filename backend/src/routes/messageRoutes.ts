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

const router = express.Router();

router.get('/conversations/:userId', getConversations);
router.get('/download-url', getDownloadUrl);
router.get('/:conversationId', getMessages);
router.post('/send', upload.single('file'), sendMessage);
router.post('/mark-read', markAsRead);
router.post('/get-or-create', getOrCreateConversation);
router.post('/hide', hideConversation);
router.post('/unhide', unhideConversation);

export default router;
