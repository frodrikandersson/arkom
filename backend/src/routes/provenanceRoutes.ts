import express from 'express';
import {
  analyzeArtwork,
  getAnalysisResults,
  submitAppeal,
} from '../controllers/provenanceController.js';

const router = express.Router();

// Analyze artwork for AI detection
router.post('/analyze/:artworkId', analyzeArtwork);

// Get existing analysis results
router.get('/results/:artworkId', getAnalysisResults);

// Submit appeal for flagged artwork
router.post('/appeal/:analysisId', submitAppeal);

export default router;
