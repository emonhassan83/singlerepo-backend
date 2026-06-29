import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';

import { getTraceId } from '@/app/configs/requestContext.configs';
import ApiError from '@/app/errors/ApiError';
import { handleDuplicateUser } from '@/app/modules/auth/auth.helpers';
import { asyncHandler } from '@/app/utils/system.utils';

/**
 * Check Duplicate User Middleware
 * Single Responsibility: Handle duplicate user checks during signup
 * Uses helper function for better maintainability and testability
 */
export const checkDuplicateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const traceId = getTraceId();

    // req.body is already validated by validateReqBody middleware
    const { email, phone, ...rest } = req.body;

    try {
      // Use helper function to handle duplicate user logic
      const result = await handleDuplicateUser(email, phone, rest, traceId);

      // If shouldProceed is false, user was already handled (restored/updated)
      if (!result.shouldProceed) {
        return next();
      }

      // Continue to next middleware for new user creation
      return next();
    } catch (err: any) {
      console.log('Error: ', err.message);
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Internal server error',
        traceId
      );
    }
  }
);

/**
 * Validate User Status Middleware
 * Checks if user is active and verified
 */
export const validateUserStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const traceId = getTraceId();
    const { userId } = req.params;

    // This middleware can be extended to check user status
    // For now, it's a placeholder for future implementation
    // You can add logic here to check if user is active, verified, etc.

    next();
  }
);

/**
 * Check User Role Middleware
 * Validates user has required role
 */
export const checkUserRole = (allowedRoles: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const traceId = getTraceId();
    const user = req.user;

    if (!user) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'User not authenticated', traceId);
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ApiError(
        HttpStatusCode.Forbidden,
        'You do not have permission to access this resource',
        traceId
      );
    }

    next();
  });
};

/**
 * Validate Email Middleware
 * Validates email format
 */
export const validateEmailFormat = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const traceId = getTraceId();
    const { email } = req.body;

    if (!email) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Email is required', traceId);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Invalid email format', traceId);
    }

    next();
  }
);

/**
 * Validate Phone Middleware
 * Validates phone number format
 */
export const validatePhoneFormat = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const traceId = getTraceId();
    const { phone } = req.body;

    if (!phone) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Phone number is required', traceId);
    }

    const phoneRegex = /^[+]?[\d\s()-]+$/;
    if (!phoneRegex.test(phone)) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Invalid phone number format', traceId);
    }

    next();
  }
);

/**
 * Validate Password Middleware
 * Validates password strength
 */
export const validatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const traceId = getTraceId();
    const { password } = req.body;

    if (!password) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Password is required', traceId);
    }

    if (password.length < 8) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Password must be at least 8 characters long',
        traceId
      );
    }

    // Add more password validation rules as needed
    // - Must contain uppercase letter
    // - Must contain lowercase letter
    // - Must contain number
    // - Must contain special character

    next();
  }
);

export const AuthMiddlewares = {
  checkDuplicateUser,
  validateUserStatus,
  checkUserRole,
  validateEmailFormat,
  validatePhoneFormat,
  validatePassword,
};