import express from 'express';
import { getUserThemes, createTheme, updateTheme, deleteTheme, setActiveTheme, getUserActiveTheme, setUserActiveTheme } from '../controllers/themeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All theme routes require authentication
router.get('/:userId', requireAuth, getUserThemes);
router.get('/active/:userId', requireAuth, getUserActiveTheme);
router.post('/', requireAuth, createTheme);
router.patch('/:themeId', requireAuth, updateTheme);
router.delete('/:themeId', requireAuth, deleteTheme);
router.post('/set-active', requireAuth, setActiveTheme);
router.post('/active', requireAuth, setUserActiveTheme);

export default router;
