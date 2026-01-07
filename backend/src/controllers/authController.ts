import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import { db } from '../config/db.js';
import { userCredentials, userSettings } from '../config/schema.js';
import { eq } from 'drizzle-orm';
import { generateEmailHtml } from '../templates/emailTemplates.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const RESET_TOKEN_EXPIRY_MINUTES = 60; // 1 hour

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRY = '7d'; // 7 days

interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { email, password, displayName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate UUID for user
    const userId = uuidv4();

    // Create user credentials
    await db.insert(userCredentials).values({
      userId,
      email: email.toLowerCase(),
      passwordHash,
    });

    // Create user settings entry
    await db.insert(userSettings).values({
      userId,
      displayName: displayName || null,
      timezone: 'UTC',
      isAdmin: false,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: userId,
        email: email.toLowerCase(),
        name: displayName || null,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        displayName: displayName || null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * Login existing user
 */
export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const users = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.email, email.toLowerCase()))
      .limit(1);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user settings for display name
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.userId))
      .limit(1);

    const displayName = settings[0]?.displayName || null;

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.userId,
        email: user.email,
        name: displayName,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.userId,
        email: user.email,
        displayName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

/**
 * Get current user (requires auth)
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user settings
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, req.user.id))
      .limit(1);

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: settings[0]?.displayName || req.user.displayName || null,
        profileImageUrl: settings[0]?.profileImageUrl || null,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

/**
 * Request password reset - sends email with reset link
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const users = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.email, email.toLowerCase()))
      .limit(1);

    // Always return success to prevent email enumeration attacks
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const user = users[0];

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiry time
    const expiryTime = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    // Save hashed token and expiry to database
    await db
      .update(userCredentials)
      .set({
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: expiryTime,
        updatedAt: new Date(),
      })
      .where(eq(userCredentials.userId, user.userId));

    // Get display name for email
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.userId))
      .limit(1);

    const displayName = settings[0]?.displayName || 'there';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Generate email HTML
    const emailHtml = generateEmailHtml('password_reset', {
      displayName,
      frontendUrl,
      resetUrl,
      expiryMinutes: RESET_TOKEN_EXPIRY_MINUTES,
    });

    // Send email
    await resend.emails.send({
      from: 'Arkom <noreply@arkom.ink>',
      to: user.email,
      subject: 'Reset your Arkom password',
      html: emailHtml,
    });

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const users = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.passwordResetToken, hashedToken))
      .limit(1);

    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = users[0];

    // Check if token has expired
    if (!user.passwordResetTokenExpiry || new Date() > user.passwordResetTokenExpiry) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await db
      .update(userCredentials)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(userCredentials.userId, user.userId));

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

/**
 * Validate reset token (optional - for frontend to check if token is valid before showing form)
 */
export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token is required' });
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const users = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.passwordResetToken, hashedToken))
      .limit(1);

    if (users.length === 0) {
      return res.json({ valid: false, error: 'Invalid reset token' });
    }

    const user = users[0];

    // Check if token has expired
    if (!user.passwordResetTokenExpiry || new Date() > user.passwordResetTokenExpiry) {
      return res.json({ valid: false, error: 'Reset token has expired' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ valid: false, error: 'Failed to validate token' });
  }
};
