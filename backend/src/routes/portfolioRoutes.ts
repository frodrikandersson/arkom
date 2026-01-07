import { Router } from 'express';
import {
  createPortfolio,
  getPortfolio,
  getUserPortfolios,
  updatePortfolio,
  updatePortfolioMediaSensitiveContent,
  deletePortfolio,
  uploadPortfolioMedia,
  updatePortfolioMedia,
  deletePortfolioMedia,
  getSensitiveContentTypes,
} from '../controllers/portfolioController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { artworkUpload } from '../config/upload.js';

const router = Router();

// Public routes
router.get('/sensitive-content-types', getSensitiveContentTypes);
router.get('/:id', optionalAuth, getPortfolio); // Public but shows more if authenticated
router.get('/user/:userId', optionalAuth, getUserPortfolios); // Public but filters by status

// Protected routes
router.post('/', requireAuth, createPortfolio);
router.put('/:id', requireAuth, updatePortfolio);
router.put('/media/:mediaId/sensitive-content', requireAuth, updatePortfolioMediaSensitiveContent);
router.delete('/:id', requireAuth, deletePortfolio);
router.post('/:id/media', requireAuth, artworkUpload.single('file'), uploadPortfolioMedia);
router.put('/media/:mediaId', requireAuth, updatePortfolioMedia);
router.delete('/media/:mediaId', requireAuth, deletePortfolioMedia);

export default router;
