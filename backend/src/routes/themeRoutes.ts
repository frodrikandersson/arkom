import express from 'express';
import { getUserThemes, createTheme, updateTheme, deleteTheme, setActiveTheme, getUserActiveTheme, setUserActiveTheme } from '../controllers/themeController.js';

const router = express.Router();

router.get('/:userId', getUserThemes);
router.get('/active/:userId', getUserActiveTheme);
router.post('/', createTheme);
router.patch('/:themeId', updateTheme);
router.delete('/:themeId', deleteTheme);
router.post('/set-active', setActiveTheme);
router.post('/active', setUserActiveTheme);

export default router;