import { AuthenticatedUser } from './middleware/authMiddleware.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
