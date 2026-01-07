import { Request, Response } from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { userSettings, services, orders, orderStatusHistory, stripeWebhookEvents } from '../config/schema.js';
import { eq } from 'drizzle-orm';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// Platform fee percentage (e.g., 5% = 0.05)
const PLATFORM_FEE_PERCENT = 0.05;

// ============================================
// STRIPE CONNECT - ONBOARDING
// ============================================

/**
 * Create a Stripe Connect account for a user and return the onboarding link
 */
export const createConnectAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userEmail = req.user!.email;

  // Validate Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new AppError(500, 'Stripe is not configured');
  }

  // Check if user already has a Stripe account
  let [user] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  // If no user settings record exists, create one
  if (!user) {
    const [newUser] = await db
      .insert(userSettings)
      .values({
        userId,
        timezone: 'UTC',
      })
      .returning();
    user = newUser;
  }

  // If user already has an account, just create a new onboarding link
  if (user.stripeAccountId) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${process.env.FRONTEND_URL}/settings?stripe=refresh`,
        return_url: `${process.env.FRONTEND_URL}/settings?stripe=success`,
        type: 'account_onboarding',
      });

      return res.json({
        success: true,
        onboardingUrl: accountLink.url,
        accountId: user.stripeAccountId,
      });
    } catch (stripeError: any) {
      console.error('Stripe accountLinks.create error:', stripeError.message);
      throw new AppError(400, stripeError.message || 'Failed to create account link');
    }
  }

  // Create new Stripe Connect Express account
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'SE', // Default to Sweden, can be made dynamic
      email: userEmail,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        arkom_user_id: userId,
      },
    });

    // Update user with Stripe account ID
    await db
      .update(userSettings)
      .set({
        stripeAccountId: account.id,
        stripeAccountStatus: 'onboarding',
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId));

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/settings?stripe=refresh`,
      return_url: `${process.env.FRONTEND_URL}/settings?stripe=success`,
      type: 'account_onboarding',
    });

    res.json({
      success: true,
      onboardingUrl: accountLink.url,
      accountId: account.id,
    });
  } catch (stripeError: any) {
    console.error('Stripe account creation error:', stripeError.message);
    throw new AppError(400, stripeError.message || 'Failed to create Stripe account');
  }
});

/**
 * Get user's Stripe Connect account status
 */
export const getConnectAccountStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [user] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  // If no user settings record or no Stripe account, return not connected
  if (!user || !user.stripeAccountId) {
    return res.json({
      success: true,
      connected: false,
      status: 'not_connected',
    });
  }

  try {
    // Fetch latest account status from Stripe
    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    // Update local status
    const newStatus = account.details_submitted
      ? account.charges_enabled && account.payouts_enabled
        ? 'active'
        : 'restricted'
      : 'onboarding';

    await db
      .update(userSettings)
      .set({
        stripeAccountStatus: newStatus,
        stripeOnboardingComplete: account.details_submitted,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId));

    res.json({
      success: true,
      connected: true,
      accountId: user.stripeAccountId,
      status: newStatus,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });
  } catch (stripeError: any) {
    console.error('Stripe accounts.retrieve error:', stripeError.message);
    // If account doesn't exist on Stripe side, reset local state
    if (stripeError.code === 'account_invalid') {
      await db
        .update(userSettings)
        .set({
          stripeAccountId: null,
          stripeAccountStatus: 'not_connected',
          stripeOnboardingComplete: false,
          stripeChargesEnabled: false,
          stripePayoutsEnabled: false,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, userId));

      return res.json({
        success: true,
        connected: false,
        status: 'not_connected',
      });
    }
    throw new AppError(400, stripeError.message || 'Failed to get account status');
  }
});

/**
 * Create a new account link (for returning to onboarding)
 */
export const createAccountLink = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [user] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (!user?.stripeAccountId) {
    throw new AppError(400, 'No Stripe account found. Please start onboarding first.');
  }

  const accountLink = await stripe.accountLinks.create({
    account: user.stripeAccountId,
    refresh_url: `${process.env.FRONTEND_URL}/settings?stripe=refresh`,
    return_url: `${process.env.FRONTEND_URL}/settings?stripe=success`,
    type: 'account_onboarding',
  });

  res.json({
    success: true,
    onboardingUrl: accountLink.url,
  });
});

/**
 * Create Stripe dashboard login link for connected account
 */
export const createDashboardLink = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [user] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (!user?.stripeAccountId) {
    throw new AppError(400, 'No Stripe account found');
  }

  const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId);

  res.json({
    success: true,
    dashboardUrl: loginLink.url,
  });
});

// ============================================
// PAYMENTS - CHECKOUT
// ============================================

/**
 * Create a payment intent for purchasing a service
 */
export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = req.user!.id;
  const { serviceId, orderType } = req.body;

  if (!serviceId) {
    throw new AppError(400, 'Service ID is required');
  }

  // Get the service
  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  if (!service) {
    throw new AppError(404, 'Service not found');
  }

  // Can't buy your own service
  if (service.userId === buyerId) {
    throw new AppError(400, 'You cannot purchase your own service');
  }

  // Get seller's Stripe account
  const [seller] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, service.userId))
    .limit(1);

  if (!seller?.stripeAccountId || !seller.stripeChargesEnabled) {
    throw new AppError(400, 'Seller has not completed payment setup');
  }

  // Calculate amounts
  const price = orderType === 'instant_order' ? service.fixedPrice : service.basePrice;
  if (!price || price <= 0) {
    throw new AppError(400, 'Invalid service price');
  }

  const subtotal = price;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT);
  const sellerPayout = subtotal - platformFee;

  // Create order record
  const orderId = uuidv4();
  const [order] = await db
    .insert(orders)
    .values({
      orderId,
      buyerId,
      sellerId: service.userId,
      serviceId: service.id,
      orderType: orderType || service.requestingProcess,
      subtotalAmount: subtotal,
      platformFeeAmount: platformFee,
      totalAmount: subtotal, // For now, total = subtotal (no extra fees to buyer)
      sellerPayoutAmount: sellerPayout,
      currency: service.currency,
      status: 'pending',
      paymentStatus: 'pending',
    })
    .returning();

  // Record initial status
  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    toStatus: 'pending',
    reason: 'Order created',
  });

  // Create Stripe PaymentIntent with automatic transfer
  const paymentIntent = await stripe.paymentIntents.create({
    amount: subtotal,
    currency: service.currency.toLowerCase(),
    application_fee_amount: platformFee,
    transfer_data: {
      destination: seller.stripeAccountId,
    },
    metadata: {
      arkom_order_id: orderId,
      arkom_service_id: serviceId.toString(),
      arkom_buyer_id: buyerId,
      arkom_seller_id: service.userId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Update order with payment intent ID
  await db
    .update(orders)
    .set({
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: 'processing',
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    orderId,
    amount: subtotal,
    currency: service.currency,
    platformFee,
    sellerPayout,
  });
});

/**
 * Get order details
 */
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { orderId } = req.params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderId, orderId))
    .limit(1);

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  // Only buyer or seller can view
  if (order.buyerId !== userId && order.sellerId !== userId) {
    throw new AppError(403, 'Not authorized to view this order');
  }

  res.json({
    success: true,
    order,
  });
});

/**
 * Get user's orders (as buyer or seller)
 */
export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { role } = req.query; // 'buyer' | 'seller' | undefined (both)

  let ordersList;

  if (role === 'buyer') {
    ordersList = await db
      .select()
      .from(orders)
      .where(eq(orders.buyerId, userId))
      .orderBy(orders.createdAt);
  } else if (role === 'seller') {
    ordersList = await db
      .select()
      .from(orders)
      .where(eq(orders.sellerId, userId))
      .orderBy(orders.createdAt);
  } else {
    // Get both
    const buyerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.buyerId, userId));
    const sellerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.sellerId, userId));
    ordersList = [...buyerOrders, ...sellerOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  res.json({
    success: true,
    orders: ordersList,
  });
});

// ============================================
// WEBHOOKS
// ============================================

/**
 * Handle Stripe webhooks
 */
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log webhook event
  await db.insert(stripeWebhookEvents).values({
    stripeEventId: event.id,
    eventType: event.type,
    eventData: event.data.object as any,
  });

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark as processed
    await db
      .update(stripeWebhookEvents)
      .set({ processed: true, processedAt: new Date() })
      .where(eq(stripeWebhookEvents.stripeEventId, event.id));

  } catch (err: any) {
    console.error(`Error processing webhook ${event.type}:`, err);
    await db
      .update(stripeWebhookEvents)
      .set({ error: err.message })
      .where(eq(stripeWebhookEvents.stripeEventId, event.id));
  }

  res.json({ received: true });
};

// Webhook handlers
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.arkom_order_id;
  if (!orderId) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderId, orderId))
    .limit(1);

  if (!order) return;

  // Update order status
  await db
    .update(orders)
    .set({
      status: 'paid',
      paymentStatus: 'succeeded',
      stripeChargeId: paymentIntent.latest_charge as string,
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  // Record status change
  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    fromStatus: order.status,
    toStatus: 'paid',
    reason: 'Payment succeeded',
  });

  // Increment service order count
  await db
    .update(services)
    .set({
      orderCount: (order.serviceId ? 1 : 0), // Would need SQL increment
      updatedAt: new Date(),
    })
    .where(eq(services.id, order.serviceId));

  // TODO: Send notification to seller
  // TODO: Send confirmation email to buyer
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.arkom_order_id;
  if (!orderId) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderId, orderId))
    .limit(1);

  if (!order) return;

  await db
    .update(orders)
    .set({
      paymentStatus: 'failed',
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    fromStatus: order.status,
    toStatus: order.status, // Status doesn't change, just payment status
    reason: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
  });
}

async function handleAccountUpdated(account: Stripe.Account) {
  const userId = account.metadata?.arkom_user_id;
  if (!userId) return;

  const newStatus = account.details_submitted
    ? account.charges_enabled && account.payouts_enabled
      ? 'active'
      : 'restricted'
    : 'onboarding';

  await db
    .update(userSettings)
    .set({
      stripeAccountStatus: newStatus,
      stripeOnboardingComplete: account.details_submitted,
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      updatedAt: new Date(),
    })
    .where(eq(userSettings.userId, userId));
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (!order) return;

  const refundAmount = charge.amount_refunded;

  await db
    .update(orders)
    .set({
      status: 'refunded',
      paymentStatus: 'refunded',
      refundAmount,
      refundedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    fromStatus: order.status,
    toStatus: 'refunded',
    reason: `Refund processed: ${refundAmount} cents`,
  });
}
