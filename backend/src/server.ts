import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import pushRoutes from './routes/pushRoutes.js';
import conversationActivityRoutes from './routes/conversationActivityRoutes.js';
import provenanceRoutes from './routes/provenanceRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import serviceCategoryRoutes from './routes/serviceCategoryRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import searchCategoryRoutes from './routes/searchCategoryRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  paymentLimiter,
} from './middleware/rateLimitMiddleware.js';
import { validateEnvironment } from './config/validateEnv.js';

dotenv.config();

// Validate environment variables before starting server
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.arkom.ink", "https://arkom.ink"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for Stripe
}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://arkom.ink',
    'https://www.arkom.ink'
  ],
  credentials: true,
}));

// Stripe webhook needs raw body - must be before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes
app.use('/', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/conversation-activity', conversationActivityRoutes);
app.use('/api/provenance', provenanceRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/service', serviceCategoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search-categories', searchCategoryRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/', sitemapRoutes); // Sitemap at root level (no /api prefix)

// Error handler MUST be last
app.use(errorHandler);

// Only listen if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
