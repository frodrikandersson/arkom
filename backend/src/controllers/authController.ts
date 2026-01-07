import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { userCredentials, userSettings } from '../config/schema.js';
import { eq } from 'drizzle-orm';

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
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
