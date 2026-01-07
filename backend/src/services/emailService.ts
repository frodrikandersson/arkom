import { Resend } from 'resend';
import { db } from '../config/db.js';
import { sql } from 'drizzle-orm';
import { generateEmailHtml, NotificationType } from '../templates/emailTemplates.js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Get user email and display name
const getUserEmailInfo = async (userId: string): Promise<{ email: string; displayName: string } | null> => {
  const result = await db.execute(sql`
    SELECT
      uc.email,
      us.display_name
    FROM user_credentials uc
    LEFT JOIN user_settings us ON uc.user_id = us.user_id
    WHERE uc.user_id = ${userId}
  `);

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0] as { email: string; display_name: string };
  return {
    email: user.email,
    displayName: user.display_name || 'there',
  };
};

// Send notification email (generic)
export const sendNotificationEmail = async (
  userId: string,
  notificationType: NotificationType,
  title: string,
  message: string,
  actionUrl?: string
): Promise<boolean> => {
  try {
    const userInfo = await getUserEmailInfo(userId);

    if (!userInfo?.email) {
      console.error('User not found or has no email:', userId);
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const emailHtml = generateEmailHtml(notificationType, {
      displayName: userInfo.displayName,
      frontendUrl,
      title,
      message,
      actionUrl,
    });

    await resend.emails.send({
      from: 'Arkom <notifications@arkom.ink>',
      to: userInfo.email,
      subject: `Arkom: ${title}`,
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
};

// Send new message notification
export const sendNewMessageEmail = async (
  userId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<boolean> => {
  try {
    const userInfo = await getUserEmailInfo(userId);

    if (!userInfo?.email) {
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const emailHtml = generateEmailHtml('new_message', {
      displayName: userInfo.displayName,
      frontendUrl,
      senderName,
      messagePreview: messagePreview.length > 150 ? messagePreview.slice(0, 150) + '...' : messagePreview,
      conversationUrl: `${frontendUrl}/messages/${conversationId}`,
    });

    await resend.emails.send({
      from: 'Arkom <notifications@arkom.ink>',
      to: userInfo.email,
      subject: `New message from ${senderName}`,
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Failed to send new message email:', error);
    return false;
  }
};

// Send commission request notification
export const sendCommissionRequestEmail = async (
  userId: string,
  requesterName: string,
  serviceName: string,
  requestId: string,
  requestDetails?: string
): Promise<boolean> => {
  try {
    const userInfo = await getUserEmailInfo(userId);

    if (!userInfo?.email) {
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const emailHtml = generateEmailHtml('commission_request', {
      displayName: userInfo.displayName,
      frontendUrl,
      requesterName,
      serviceName,
      requestDetails,
      requestUrl: `${frontendUrl}/requests/${requestId}`,
    });

    await resend.emails.send({
      from: 'Arkom <notifications@arkom.ink>',
      to: userInfo.email,
      subject: `New commission request for ${serviceName}`,
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Failed to send commission request email:', error);
    return false;
  }
};

// Send commission status update notification
export const sendCommissionUpdateEmail = async (
  userId: string,
  serviceName: string,
  status: string,
  commissionId: string,
  statusMessage?: string
): Promise<boolean> => {
  try {
    const userInfo = await getUserEmailInfo(userId);

    if (!userInfo?.email) {
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const emailHtml = generateEmailHtml('commission_update', {
      displayName: userInfo.displayName,
      frontendUrl,
      serviceName,
      status,
      statusMessage,
      commissionUrl: `${frontendUrl}/commissions/${commissionId}`,
    });

    await resend.emails.send({
      from: 'Arkom <notifications@arkom.ink>',
      to: userInfo.email,
      subject: `Commission update: ${serviceName}`,
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Failed to send commission update email:', error);
    return false;
  }
};

// Send new follower notification
export const sendNewFollowerEmail = async (
  userId: string,
  followerName: string,
  followerUsername: string,
  followerId: string
): Promise<boolean> => {
  try {
    const userInfo = await getUserEmailInfo(userId);

    if (!userInfo?.email) {
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const emailHtml = generateEmailHtml('new_follower', {
      displayName: userInfo.displayName,
      frontendUrl,
      followerName,
      followerUsername,
      followerProfileUrl: `${frontendUrl}/profile/${followerId}`,
    });

    await resend.emails.send({
      from: 'Arkom <notifications@arkom.ink>',
      to: userInfo.email,
      subject: `${followerName} is now following you`,
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Failed to send new follower email:', error);
    return false;
  }
};

// Send payment received notification
export const sendPaymentReceivedEmail = async (
  userId: string,
  amount: string,
  currency: string,
  serviceName: string,
  clientName: string,
  transactionId?: string
): Promise<boolean> => {
  try {
    const userInfo = await getUserEmailInfo(userId);

    if (!userInfo?.email) {
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const emailHtml = generateEmailHtml('payment_received', {
      displayName: userInfo.displayName,
      frontendUrl,
      amount,
      currency,
      serviceName,
      clientName,
      transactionUrl: transactionId ? `${frontendUrl}/transactions/${transactionId}` : undefined,
    });

    await resend.emails.send({
      from: 'Arkom <notifications@arkom.ink>',
      to: userInfo.email,
      subject: `Payment received: ${amount} ${currency}`,
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Failed to send payment received email:', error);
    return false;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (userId: string): Promise<boolean> => {
  try {
    const userInfo = await getUserEmailInfo(userId);

    if (!userInfo?.email) {
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const emailHtml = generateEmailHtml('welcome', {
      displayName: userInfo.displayName,
      frontendUrl,
    });

    await resend.emails.send({
      from: 'Arkom <welcome@arkom.ink>',
      to: userInfo.email,
      subject: 'Welcome to Arkom!',
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
};
