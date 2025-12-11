import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js';
import counterRoutes from './routes/counterRoutes.js';
import themeRoutes from './routes/themeRoutes.js';

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

// Only listen if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;