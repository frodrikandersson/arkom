import express from 'express';
import { getRoot, getHealth } from '../controllers/healthController.js';

const router = express.Router();

router.get('/', getRoot);
router.get('/health', getHealth);

export default router;