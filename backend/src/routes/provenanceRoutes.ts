import express from 'express';
import {
  analyzeArtwork,
  getAnalysisResults,
  submitAppeal,
} from '../controllers/provenanceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Admin-only route - analyze artwork for AI detection
router.post('/analyze', requireAuth, requireAdmin, analyzeArtwork); 

// Admin-only route - view analysis results
router.get('/results/:portfolioId', requireAuth, requireAdmin, getAnalysisResults);

// User route - submit appeal (requires auth but not admin)
router.post('/appeal/:analysisId', requireAuth, submitAppeal);

export default router;
