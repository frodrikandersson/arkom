import express from 'express';
import { getUserThemes, createTheme, updateTheme, deleteTheme, setActiveTheme } from '../controllers/themeController.js';

const router = express.Router();

router.get('/:userId', getUserThemes);
router.post('/', createTheme);
router.patch('/:themeId', updateTheme);
router.delete('/:themeId', deleteTheme);
router.post('/set-active', setActiveTheme);

export default router;