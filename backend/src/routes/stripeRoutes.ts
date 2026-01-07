import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  createConnectAccount,
  getConnectAccountStatus,
  createAccountLink,
  createDashboardLink,
  createPaymentIntent,
  getOrder,
  getUserOrders,
  handleWebhook,
} from '../controllers/stripeController.js';

const router = express.Router();

// ============================================
// STRIPE CONNECT ROUTES (require auth)
// ============================================

// Create/start Stripe Connect onboarding
router.post('/connect/onboard', requireAuth, createConnectAccount);

// Get connected account status
router.get('/connect/status', requireAuth, getConnectAccountStatus);

// Create new account link (return to onboarding)
router.post('/connect/account-link', requireAuth, createAccountLink);

// Get Stripe dashboard login link
router.post('/connect/dashboard-link', requireAuth, createDashboardLink);

// ============================================
// PAYMENT ROUTES (require auth)
// ============================================

// Create payment intent for a service
router.post('/payment/create-intent', requireAuth, createPaymentIntent);

// ============================================
// ORDER ROUTES (require auth)
// ============================================

// Get user's orders
router.get('/orders', requireAuth, getUserOrders);

// Get specific order
router.get('/orders/:orderId', requireAuth, getOrder);

// ============================================
// WEBHOOK ROUTE (no auth - Stripe calls this)
// ============================================
// Note: Raw body middleware is configured in server.ts before express.json()
router.post('/webhook', handleWebhook);

export default router;
