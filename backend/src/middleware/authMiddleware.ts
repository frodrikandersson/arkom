import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { AppError } from './errorMiddleware.js';

const STACK_PROJECT_ID = '5c9b9bd7-de3b-41f8-8858-13d1f8ae51c2';
const JWKS_URI = `https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}/.well-known/jwks.json`;

// Create JWKS client to fetch public keys for JWT verification
const client = jwksClient({
  jwksUri: JWKS_URI,
  cache: true,
  rateLimit: true,
});

// Function to get signing key from JWKS
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName?: string;
}

/**
 * Middleware to verify JWT token from Stack Auth and attach authenticated user to request
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

    // Verify JWT token with Stack Auth's public key
    const decoded = await new Promise<any>((resolve, reject) => {
      jwt.verify(token, getKey, {
        algorithms: ['ES256'],
        issuer: `https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}`,
      }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

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

    const decoded = await new Promise<any>((resolve, reject) => {
      jwt.verify(token, getKey, {
        algorithms: ['RS256'],
        issuer: `https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}`,
      }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

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
