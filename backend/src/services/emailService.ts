import { Resend } from 'resend';
import { db } from '../config/db.js';
import { sql } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

// Send notification email
export const sendNotificationEmail = async (
  userId: string,
  notificationType: string,
  title: string,
  message: string,
  actionUrl?: string
): Promise<boolean> => {
  try {
    
    // Get user's email from Stack Auth
    const result = await db.execute(sql`
      SELECT 
        raw_json->>'primary_email' as email,
        raw_json->>'display_name' as display_name
      FROM neon_auth.users_sync 
      WHERE raw_json->>'id' = ${userId}
    `);

    if (result.rows.length === 0) {
      console.error('User not found:', userId);
      return false;
    }

    const user = result.rows[0] as { email: string; display_name: string };
    
    if (!user.email) {
      console.error('User has no email:', userId);
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const fullActionUrl = actionUrl ? `${frontendUrl}${actionUrl}` : frontendUrl;

    // Create email HTML
    const emailHtml = `
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Arkom</h1>
            </div>
            <div class="content">
              <p class="greeting">Hi ${user.display_name || 'there'},</p>
              
              <div class="notification-box">
                <h2 class="notification-title">${title}</h2>
                <p class="notification-message">${message}</p>
              </div>
              
              ${actionUrl ? `
                <div class="button-container">
                  <a href="${fullActionUrl}" class="button">View Notification</a>
                </div>
              ` : ''}
              
              <p class="footer-note">
                You're receiving this email because you have email notifications enabled in your Arkom settings.
              </p>
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

    // Send email using Resend
    await resend.emails.send({
      from: 'Arkom <notifications@arkom.ink>',
      to: user.email,
      subject: `Arkom: ${title}`,
      html: emailHtml,
    });
    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
};
