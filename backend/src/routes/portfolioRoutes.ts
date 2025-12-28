import { Router } from 'express';
import multer from 'multer';
import {
  createPortfolio,
  getPortfolio,
  getUserPortfolios,
  updatePortfolio,
  deletePortfolio,
  uploadPortfolioMedia,
  deletePortfolioMedia,
  getSensitiveContentTypes,
} from '../controllers/portfolioController.js';

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

// Get sensitive content types (public - for UI dropdown)
router.get('/sensitive-content-types', getSensitiveContentTypes);

// Create new portfolio
router.post('/', createPortfolio);

// Get portfolio by ID
router.get('/:id', getPortfolio);

// Get user's portfolios
router.get('/user/:userId', getUserPortfolios);

// Update portfolio
router.put('/:id', updatePortfolio);

// Delete portfolio
router.delete('/:id', deletePortfolio);

// Upload media to portfolio (image or YouTube)
router.post('/:id/media', upload.single('file'), uploadPortfolioMedia);

// Delete media from portfolio
router.delete('/media/:mediaId', deletePortfolioMedia);

export default router;
