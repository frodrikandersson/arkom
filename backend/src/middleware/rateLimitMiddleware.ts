import rateLimit from 'express-rate-limit';

// List of endpoints that poll frequently and should be exempt from rate limiting
// Note: These paths are relative to /api since the limiter is applied to /api routes
const POLLING_ENDPOINTS = [
  '/notifications',
  '/messages',
  '/conversation-activity',
];

// General API rate limiter - 200 requests per 1 minute for non-polling endpoints
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for polling endpoints
    // req.path here is relative to /api (e.g., /notifications/user-id)
    return POLLING_ENDPOINTS.some(endpoint => req.path.startsWith(endpoint));
  },
});

// Strict rate limiter for auth endpoints - 10 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts, please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset limiter - 3 requests per hour
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts, please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Message sending limiter - 60 messages per minute
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'You are sending messages too quickly, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload limiter - 30 uploads per hour
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stripe payment creation limiter - 10 payment intents per hour
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many payment attempts, please contact support if this is an error.',
  standardHeaders: true,
  legacyHeaders: false,
});
