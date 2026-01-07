import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName?: string;
}

/**
 * Middleware to verify JWT token and attach authenticated user to request
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No valid Bearer token');
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const token = authHeader.substring(7);

    // Verify JWT token with our secret key
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    req.user = {
      id: decoded.sub,
      email: decoded.email || '',
      displayName: decoded.name || undefined,
    };

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Optional auth - attaches user if token exists but doesn't fail if missing
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = undefined;
      return next();
    }

    const token = authHeader.substring(7);

    // Verify JWT token with our secret key
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    req.user = {
      id: decoded.sub,
      email: decoded.email || '',
      displayName: decoded.name || undefined,
    };

    next();
  } catch (error) {
    req.user = undefined;
    next();
  }
};
