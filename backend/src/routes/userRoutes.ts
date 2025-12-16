import express from 'express';
import { getUserSettings, updateUserSettings } from '../controllers/userController.js';

const router = express.Router();

router.get('/:userId/settings', getUserSettings);
router.put('/:userId/settings', updateUserSettings);

export default router;