import express from 'express';
import { sendNotificationEmail } from '../services/emailService.js';
import { sendPushNotification } from '../services/pushService.js';
import { createNotification } from '../controllers/notificationController.js';

const router = express.Router();

// Test email notification
router.post('/test-email', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const success = await sendNotificationEmail(
      userId,
      'test',
      'Test Email Notification',
      'This is a test email notification from Arkom. If you received this, your email notifications are working!',
      '/settings'
    );

    if (success) {
      res.json({ success: true, message: 'Test email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send test email' });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test push notification
router.post('/test-push', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const success = await sendPushNotification(userId, {
      title: 'Test Push Notification',
      body: 'This is a test push notification from Arkom. If you see this, push notifications are working!',
      icon: `${frontendUrl}/icon-192.png`,
      badge: `${frontendUrl}/badge-96.png`,
      data: {
        url: `${frontendUrl}/settings`,
        notificationId: 'test',
      },
    });

    if (success) {
      res.json({ success: true, message: 'Test push sent successfully' });
    } else {
      res.json({ success: false, message: 'No push subscriptions found or push failed' });
    }
  } catch (error) {
    console.error('Test push error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test full notification (creates DB entry + sends email/push)
router.post('/test-notification', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    await createNotification(
      userId,
      'test',
      'Test Notification',
      'This is a complete test notification. Check your email and browser for notifications!',
      'test-123',
      userId,
      '/settings'
    );

    res.json({ 
      success: true, 
      message: 'Test notification created. Check your email and browser!' 
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
