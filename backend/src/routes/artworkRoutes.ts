import express from 'express';
import multer from 'multer';
import {
  uploadArtwork,
  getUserArtworks,
  getArtwork,
  updateArtwork,
  deleteArtwork,
} from '../controllers/artworkController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload artwork
router.post('/:userId/upload', upload.single('image'), uploadArtwork);

// Get user's artworks
router.get('/user/:userId', getUserArtworks);

// Get single artwork
router.get('/:artworkId', getArtwork);

// Update artwork
router.put('/:artworkId', updateArtwork);

// Delete artwork
router.delete('/:artworkId', deleteArtwork);

export default router;
