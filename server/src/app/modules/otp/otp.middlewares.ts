import { Request, Response, NextFunction } from 'express';

import { getTraceId } from '@/app/configs/requestContext.configs';
import ApiError from '@/app/errors/ApiError';

/**
 * OTP Type Validation Middleware
 * Validates that the OTP type is valid before processing
 */
export const validateOtpType = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const traceId = getTraceId();
  const { type } = req.query;

  const validOtpTypes = ['signup', 'forgot', 'login', 'changeEmail', 'changePhone'];

  if (!type || !validOtpTypes.includes(type as string)) {
    throw new ApiError(
      400,
      'Invalid OTP type. Must be one of: signup, forgot, login, changeEmail, changePhone',
      traceId
    );
  }

  next();
};

/**
 * OTP Verification Check Middleware
 * Checks if OTP has already been verified for the current request
 */
export const checkOtpNotVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const traceId = getTraceId();
  const { type } = req.query;

  // This middleware can be extended to check if OTP is already verified
  // For now, it's a placeholder for future implementation
  // You can add logic here to prevent re-verification

  next();
};

/**
 * Development Mode OTP Logger Middleware
 * Logs OTP details in development mode for testing
 */
export const logOtpInDevelopment = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // This middleware is mainly for debugging purposes
  // Actual OTP logging is handled in the helper functions
  next();
};

// Rate limit map for OTP requests
const otpRateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate Limiting for OTP Requests
 * Prevents abuse by limiting OTP request frequency
 */
export const otpRateLimit = (maxRequests: number = 5, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const traceId = getTraceId();
    const clientId = req.ip || req.body.email || req.body.phone || 'unknown';
    const now = Date.now();

    const clientData = otpRateLimitMap.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      otpRateLimitMap.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (clientData.count >= maxRequests) {
      throw new ApiError(
        429,
        `Too many OTP requests. Please try again after ${Math.ceil((clientData.resetTime - now) / 1000)} seconds`,
        traceId
      );
    }

    clientData.count++;
    next();
  };
};

/**
 * Cleanup expired rate limit entries periodically
 */
export const cleanupRateLimitMap = (): void => {
  const now = Date.now();
  for (const [key, value] of otpRateLimitMap.entries()) {
    if (now > value.resetTime) {
      otpRateLimitMap.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitMap, 5 * 60 * 1000);

/**
 * OTP Request Validator Middleware
 * Validates that required fields are present for OTP requests
 */
export const validateOtpRequest = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const traceId = getTraceId();
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      throw new ApiError(
        400,
        `Missing required fields: ${missingFields.join(', ')}`,
        traceId
      );
    }

    next();
  };
};

/**
 * Email Validation Middleware
 * Validates email format for OTP email requests
 */
export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const traceId = getTraceId();
  const email = req.body.email;

  if (!email) {
    throw new ApiError(400, 'Email is required', traceId);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email format', traceId);
  }

  next();
};

/**
 * Phone Validation Middleware
 * Validates phone number format for OTP SMS requests
 */
export const validatePhone = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const traceId = getTraceId();
  const phone = req.body.phone;

  if (!phone) {
    throw new ApiError(400, 'Phone number is required', traceId);
  }

  // Basic phone validation - can be enhanced based on requirements
  const phoneRegex = /^[+]?[\d\s()-]+$/;
  if (!phoneRegex.test(phone)) {
    throw new ApiError(400, 'Invalid phone number format', traceId);
  }

  next();
};

export const OtpMiddlewares = {
  validateOtpType,
  checkOtpNotVerified,
  logOtpInDevelopment,
  otpRateLimit,
  validateOtpRequest,
  validateEmail,
  validatePhone,
};