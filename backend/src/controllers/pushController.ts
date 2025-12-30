import { Request, Response } from 'express';
import { savePushSubscription, removePushSubscription } from '../services/pushService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Subscribe to push notifications
export const subscribeToPush = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { subscription } = req.body;

  if (!subscription) {
    throw new AppError(400, 'Missing subscription');
  }

  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new AppError(400, 'Invalid subscription format');
  }

  const success = await savePushSubscription(userId, subscription);
  
  if (!success) {
    throw new AppError(500, 'Failed to save subscription');
  }
  
  res.json({ success: true });
});

// Unsubscribe from push notifications
export const unsubscribeFromPush = asyncHandler(async (req: Request, res: Response) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    throw new AppError(400, 'Endpoint is required');
  }

  const success = await removePushSubscription(endpoint);
  
  if (!success) {
    throw new AppError(500, 'Failed to remove subscription');
  }
  
  res.json({ success: true });
});
