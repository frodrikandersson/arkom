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

const router = express.Router();

// Settings
router.get('/:userId/settings', getUserSettings);
router.put('/:userId/settings', updateUserSettings);

// Profile
router.get('/profile/:userId', getUserProfile);
router.put('/:userId/profile', updateUserProfile);
router.post('/:userId/profile-image', upload.single('image'), uploadProfileImage);
router.post('/:userId/banner-image', upload.single('image'), uploadBannerImage);

// User search
router.get('/search', searchUsers);

// Block/Report
router.post('/block', blockUser);
router.post('/unblock', unblockUser);
router.get('/:userId/blocked', getBlockedUsers);
router.get('/check-blocked', checkIfBlocked);
router.post('/report', reportUser);

export default router;
