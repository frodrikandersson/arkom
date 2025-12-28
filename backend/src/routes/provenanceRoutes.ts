import express from 'express';
import {
  analyzeArtwork,
  getAnalysisResults,
  submitAppeal,
} from '../controllers/provenanceController.js';

const router = express.Router();

router.post('/analyze', analyzeArtwork); 
router.get('/results/:portfolioId', getAnalysisResults);
router.post('/appeal/:analysisId', submitAppeal);

export default router;
