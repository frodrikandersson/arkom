import { Router } from 'express';
import multer from 'multer';
import {
  createPortfolio,
  getPortfolio,
  getUserPortfolios,
  updatePortfolio,
  deletePortfolio,
  uploadPortfolioMedia,
  updatePortfolioMedia,
  deletePortfolioMedia,
  getSensitiveContentTypes,
} from '../controllers/portfolioController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.'));
    }
  },
});

// Public routes
router.get('/sensitive-content-types', getSensitiveContentTypes);
router.get('/:id', optionalAuth, getPortfolio); // Public but shows more if authenticated
router.get('/user/:userId', optionalAuth, getUserPortfolios); // Public but filters by status

// Protected routes
router.post('/', requireAuth, createPortfolio);
router.put('/:id', requireAuth, updatePortfolio);
router.delete('/:id', requireAuth, deletePortfolio);
router.post('/:id/media', requireAuth, upload.single('file'), uploadPortfolioMedia);
router.put('/media/:mediaId', requireAuth, updatePortfolioMedia);
router.delete('/media/:mediaId', requireAuth, deletePortfolioMedia);

export default router;
