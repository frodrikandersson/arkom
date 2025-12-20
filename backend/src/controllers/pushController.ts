import { Request, Response } from 'express';
import { savePushSubscription, removePushSubscription } from '../services/pushService.js';

// Subscribe to push notifications
export const subscribeToPush = async (req: Request, res: Response) => {
  try {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      res.status(400).json({ error: 'Invalid subscription format' });
      return;
    }

    const success = await savePushSubscription(userId, subscription);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save subscription' });
    }
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      res.status(400).json({ error: 'Endpoint is required' });
      return;
    }

    const success = await removePushSubscription(endpoint);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to remove subscription' });
    }
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
