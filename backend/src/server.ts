import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js';
import counterRoutes from './routes/counterRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import pushRoutes from './routes/pushRoutes.js';
import testRoutes from './routes/testRoutes.js';
import conversationActivityRoutes from './routes/conversationActivityRoutes.js';
import provenanceRoutes from './routes/provenanceRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://arkom.ink',
    'https://www.arkom.ink'
  ],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/', healthRoutes);
app.use('/api/counter', counterRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/test', testRoutes);
app.use('/api/conversation-activity', conversationActivityRoutes);
app.use('/api/provenance', provenanceRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Only listen if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;