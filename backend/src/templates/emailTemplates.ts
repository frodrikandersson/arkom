// Base layout wrapper for all emails
const baseLayout = (content: string, frontendUrl: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 30px 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        color: #ffffff;
        font-size: 24px;
        font-weight: 600;
      }
      .content {
        padding: 30px 20px;
      }
      .greeting {
        color: #333;
        font-size: 16px;
        margin-bottom: 20px;
      }
      .notification-box {
        background-color: #f8f9fa;
        border-left: 4px solid #667eea;
        padding: 20px;
        margin: 20px 0;
        border-radius: 4px;
      }
      .notification-box.success {
        border-left-color: #28a745;
      }
      .notification-box.warning {
        border-left-color: #ffc107;
      }
      .notification-box.error {
        border-left-color: #dc3545;
      }
      .notification-box.info {
        border-left-color: #17a2b8;
      }
      .notification-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0 0 10px 0;
      }
      .notification-message {
        color: #666;
        margin: 0;
        font-size: 15px;
      }
      .button-container {
        text-align: center;
        margin: 30px 0;
      }
      .button {
        display: inline-block;
        padding: 14px 32px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 15px;
      }
      .button.success {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      }
      .footer-note {
        margin-top: 30px;
        color: #666;
        font-size: 14px;
        line-height: 1.5;
      }
      .footer {
        text-align: center;
        padding: 20px;
        color: #999;
        font-size: 12px;
        border-top: 1px solid #eee;
        margin-top: 30px;
      }
      .footer a {
        color: #667eea;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
      .details-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      .details-table td {
        padding: 10px 0;
        border-bottom: 1px solid #eee;
      }
      .details-table td:first-child {
        color: #666;
        width: 40%;
      }
      .details-table td:last-child {
        font-weight: 500;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Arkom</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>
          <a href="${frontendUrl}/settings">Manage notification preferences</a> ·
          <a href="${frontendUrl}">Visit Arkom</a>
        </p>
        <p>&copy; ${new Date().getFullYear()} Arkom. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

// Template data interfaces
interface BaseTemplateData {
  displayName: string;
  frontendUrl: string;
}

interface GenericNotificationData extends BaseTemplateData {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

interface NewMessageData extends BaseTemplateData {
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
}

interface CommissionRequestData extends BaseTemplateData {
  requesterName: string;
  serviceName: string;
  requestDetails?: string;
  requestUrl: string;
}

interface CommissionUpdateData extends BaseTemplateData {
  serviceName: string;
  status: string;
  statusMessage?: string;
  commissionUrl: string;
}

interface NewFollowerData extends BaseTemplateData {
  followerName: string;
  followerUsername: string;
  followerProfileUrl: string;
}

interface PaymentReceivedData extends BaseTemplateData {
  amount: string;
  currency: string;
  serviceName: string;
  clientName: string;
  transactionUrl?: string;
}

interface PasswordResetData extends BaseTemplateData {
  resetUrl: string;
  expiryMinutes: number;
}

// Template generators
const templates = {
  // Generic notification (fallback)
  generic: (data: GenericNotificationData): string => {
    const content = `
      <p class="greeting">Hi ${data.displayName},</p>

      <div class="notification-box">
        <h2 class="notification-title">${data.title}</h2>
        <p class="notification-message">${data.message}</p>
      </div>

      ${data.actionUrl ? `
        <div class="button-container">
          <a href="${data.frontendUrl}${data.actionUrl}" class="button">${data.actionText || 'View Notification'}</a>
        </div>
      ` : ''}

      <p class="footer-note">
        You're receiving this email because you have email notifications enabled in your Arkom settings.
      </p>
    `;
    return baseLayout(content, data.frontendUrl);
  },

  // New message notification
  new_message: (data: NewMessageData): string => {
    const content = `
      <p class="greeting">Hi ${data.displayName},</p>

      <p>You have a new message from <strong>${data.senderName}</strong>:</p>

      <div class="notification-box info">
        <p class="notification-message">"${data.messagePreview}"</p>
      </div>

      <div class="button-container">
        <a href="${data.conversationUrl}" class="button">View Conversation</a>
      </div>

      <p class="footer-note">
        You're receiving this email because you have message notifications enabled.
      </p>
    `;
    return baseLayout(content, data.frontendUrl);
  },

  // New commission request
  commission_request: (data: CommissionRequestData): string => {
    const content = `
      <p class="greeting">Hi ${data.displayName},</p>

      <p>Great news! <strong>${data.requesterName}</strong> has submitted a commission request for your service.</p>

      <div class="notification-box success">
        <h2 class="notification-title">${data.serviceName}</h2>
        ${data.requestDetails ? `<p class="notification-message">${data.requestDetails}</p>` : ''}
      </div>

      <div class="button-container">
        <a href="${data.requestUrl}" class="button success">Review Request</a>
      </div>

      <p class="footer-note">
        Please respond to this request within your usual timeframe to maintain good client relationships.
      </p>
    `;
    return baseLayout(content, data.frontendUrl);
  },

  // Commission status update
  commission_update: (data: CommissionUpdateData): string => {
    const boxClass = data.status === 'completed' ? 'success' :
                     data.status === 'cancelled' ? 'error' : 'info';

    const content = `
      <p class="greeting">Hi ${data.displayName},</p>

      <p>Your commission has been updated:</p>

      <div class="notification-box ${boxClass}">
        <h2 class="notification-title">${data.serviceName}</h2>
        <p class="notification-message">Status: <strong>${data.status.toUpperCase()}</strong></p>
        ${data.statusMessage ? `<p class="notification-message">${data.statusMessage}</p>` : ''}
      </div>

      <div class="button-container">
        <a href="${data.commissionUrl}" class="button">View Commission</a>
      </div>

      <p class="footer-note">
        You're receiving this email because you have commission notifications enabled.
      </p>
    `;
    return baseLayout(content, data.frontendUrl);
  },

  // New follower notification
  new_follower: (data: NewFollowerData): string => {
    const content = `
      <p class="greeting">Hi ${data.displayName},</p>

      <p>You have a new follower!</p>

      <div class="notification-box info">
        <h2 class="notification-title">${data.followerName}</h2>
        <p class="notification-message">@${data.followerUsername} is now following you</p>
      </div>

      <div class="button-container">
        <a href="${data.followerProfileUrl}" class="button">View Profile</a>
      </div>

      <p class="footer-note">
        You're receiving this email because you have follower notifications enabled.
      </p>
    `;
    return baseLayout(content, data.frontendUrl);
  },

  // Payment received
  payment_received: (data: PaymentReceivedData): string => {
    const content = `
      <p class="greeting">Hi ${data.displayName},</p>

      <p>You've received a payment!</p>

      <div class="notification-box success">
        <h2 class="notification-title">${data.amount} ${data.currency}</h2>
        <table class="details-table">
          <tr>
            <td>Service</td>
            <td>${data.serviceName}</td>
          </tr>
          <tr>
            <td>From</td>
            <td>${data.clientName}</td>
          </tr>
        </table>
      </div>

      ${data.transactionUrl ? `
        <div class="button-container">
          <a href="${data.transactionUrl}" class="button success">View Transaction</a>
        </div>
      ` : ''}

      <p class="footer-note">
        This payment will be available in your account according to our standard payout schedule.
      </p>
    `;
    return baseLayout(content, data.frontendUrl);
  },

  // Welcome email
  welcome: (data: BaseTemplateData): string => {
    const content = `
      <p class="greeting">Welcome to Arkom, ${data.displayName}!</p>

      <p>We're excited to have you join our creative community. Here are some things you can do to get started:</p>

      <div class="notification-box">
        <h2 class="notification-title">Complete Your Profile</h2>
        <p class="notification-message">Add a profile picture, bio, and social links to help others discover you.</p>
      </div>

      <div class="notification-box">
        <h2 class="notification-title">Create Your First Portfolio</h2>
        <p class="notification-message">Showcase your best work to attract potential clients.</p>
      </div>

      <div class="notification-box">
        <h2 class="notification-title">Set Up Commission Services</h2>
        <p class="notification-message">Start accepting commissions by creating your service offerings.</p>
      </div>

      <div class="button-container">
        <a href="${data.frontendUrl}/settings" class="button">Complete Your Profile</a>
      </div>

      <p class="footer-note">
        If you have any questions, feel free to reach out to our support team.
      </p>
    `;
    return baseLayout(content, data.frontendUrl);
  },

  // Password reset email
  password_reset: (data: PasswordResetData): string => {
    const content = `
      <p class="greeting">Hi ${data.displayName},</p>

      <p>We received a request to reset your password. Click the button below to create a new password:</p>

      <div class="button-container">
        <a href="${data.resetUrl}" class="button">Reset Password</a>
      </div>

      <div class="notification-box warning">
        <h2 class="notification-title">Link Expires Soon</h2>
        <p class="notification-message">This link will expire in ${data.expiryMinutes} minutes for security reasons.</p>
      </div>

      <p class="footer-note">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <p class="footer-note" style="font-size: 12px; color: #999;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${data.resetUrl}" style="color: #667eea; word-break: break-all;">${data.resetUrl}</a>
      </p>
    `;
    return baseLayout(content, data.frontendUrl);
  },
};

// Notification type mapping
export type NotificationType = keyof typeof templates;

// Main function to generate email HTML
export const generateEmailHtml = (
  notificationType: NotificationType,
  data: any
): string => {
  const templateFn = templates[notificationType];

  if (!templateFn) {
    // Fallback to generic template
    return templates.generic(data as GenericNotificationData);
  }

  return templateFn(data);
};

// Export individual template data types for type safety
export type {
  BaseTemplateData,
  GenericNotificationData,
  NewMessageData,
  CommissionRequestData,
  CommissionUpdateData,
  NewFollowerData,
  PaymentReceivedData,
  PasswordResetData,
};
