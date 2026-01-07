import express from 'express';
import {
  createService,
  getUserServices,
  getServicesByUserId,
  getServicesByType,
  getServiceById,
  updateService,
  deleteService,
  uploadServiceMedia,
  deleteServiceMedia,
} from '../controllers/serviceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { artworkUpload } from '../config/upload.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/user/:userId', getServicesByUserId);
router.get('/browse/:type', getServicesByType);
router.get('/:serviceId', getServiceById);

// All routes below require authentication
router.use(requireAuth);

// Service CRUD
router.post('/', createService);
router.get('/', getUserServices);
router.put('/:serviceId', updateService);
router.delete('/:serviceId', deleteService);

// Service media (handles both images and YouTube URLs)
router.post('/:serviceId/media', artworkUpload.single('file'), uploadServiceMedia);
router.delete('/media/:mediaId', deleteServiceMedia);

export default router;
