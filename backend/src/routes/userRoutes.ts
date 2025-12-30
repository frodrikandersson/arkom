import express from 'express';
import { 
  searchUsers, 
  getUserSettings, 
  updateUserSettings, 
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  uploadBannerImage,
  blockUser,
  unblockUser,
  getBlockedUsers,
  checkIfBlocked,
  reportUser
} from '../controllers/userController.js';
import { upload } from '../config/upload.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/search', optionalAuth, searchUsers); // Public but hides blocked users if authenticated
router.get('/profile/:userId', optionalAuth, getUserProfile); // Public
router.get('/check-blocked', optionalAuth, checkIfBlocked); // Public

// Protected routes - Settings
router.get('/:userId/settings', requireAuth, getUserSettings);
router.put('/:userId/settings', requireAuth, updateUserSettings);

// Protected routes - Profile updates
router.put('/:userId/profile', requireAuth, updateUserProfile);
router.post('/:userId/profile-image', requireAuth, upload.single('image'), uploadProfileImage);
router.post('/:userId/banner-image', requireAuth, upload.single('image'), uploadBannerImage);

// Protected routes - Block/Report
router.post('/block', requireAuth, blockUser);
router.post('/unblock', requireAuth, unblockUser);
router.get('/:userId/blocked', requireAuth, getBlockedUsers);
router.post('/report', requireAuth, reportUser);

export default router;
