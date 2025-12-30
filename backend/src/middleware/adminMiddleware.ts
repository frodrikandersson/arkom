import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorMiddleware.js';

/**
 * Middleware to check if user is an admin
 * 
 * NOTE: This is a placeholder implementation.
 * 
 * TODO: Implement proper admin check using one of these approaches:
 * 1. Stack Auth roles - Check if req.user has admin role from JWT claims
 * 2. Database role field - Add 'role' column to users table and check it
 * 3. Admin list - Maintain a list of admin user IDs in env variables
 * 
 * For now, this always denies access until properly configured.
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    // TODO: Implement actual admin check
    // Option 1: Check Stack Auth JWT claims for admin role
    // const hasAdminRole = req.user.roles?.includes('admin');
    
    // Option 2: Check database for user role
    // const user = await db.query.users.findFirst({
    //   where: eq(users.id, req.user.id)
    // });
    // const isAdmin = user?.role === 'admin';
    
    // Option 3: Check against admin list from env
    // const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    // const isAdmin = adminIds.includes(req.user.id);
    
    // For now, deny all access
    const isAdmin = false;

    if (!isAdmin) {
      throw new AppError(403, 'Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
