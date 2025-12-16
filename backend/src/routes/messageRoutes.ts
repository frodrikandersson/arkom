import express from 'express';
import { getConversations, getMessages, sendMessage, markAsRead, getDownloadUrl } from '../controllers/messageController.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.get('/conversations/:userId', getConversations);
router.get('/:conversationId', getMessages);
router.post('/send', upload.single('file'), sendMessage);
router.post('/mark-read', markAsRead);
router.get('/download-url', getDownloadUrl);

export default router;