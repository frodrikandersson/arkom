import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StackServerApp } from '@stackframe/stack';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Neon Auth server
const stack = new StackServerApp({
  tokenStore: 'cookie',
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Protected route example
app.get('/api/protected', async (req, res) => {
  try {
    const user = await stack.getUser();
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({ message: 'This is protected', userId: user.id });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Only listen if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;