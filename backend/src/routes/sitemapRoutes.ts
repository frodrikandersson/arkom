import express from 'express';
import { generateSitemap } from '../controllers/sitemapController.js';

const router = express.Router();

// Generate dynamic sitemap (no auth required - public)
router.get('/sitemap.xml', generateSitemap);

export default router;
