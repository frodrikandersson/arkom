import express from 'express';
import { searchUsers, getUserSettings, updateUserSettings, getUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/:userId/settings', getUserSettings);
router.put('/:userId/settings', updateUserSettings);
router.get('/search', searchUsers);
router.get('/profile/:userId', getUserProfile);

export default router;