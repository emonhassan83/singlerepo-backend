import { Router } from 'express';

import { OtpControllers } from '@/app/modules/otp/otp.controllers';
import { OtpMiddlewares } from '@/app/modules/otp/otp.middlewares';
import { OtpValidations } from '@/app/modules/otp/otp.validation';
import validateRequest from '@/app/utils/validateRequest';

const router = Router();

// Verify OTP - requires OTP type validation
router
  .route('/verify')
  .post(
    validateRequest(OtpValidations.verifyOtpZodSchema),
    OtpMiddlewares.validateOtpType,
    OtpControllers.verifyOTP
  );

// Send OTP via Email - with rate limiting and email validation
router
  .route('/send-otp-in-email')
  .post(
    OtpMiddlewares.otpRateLimit(5, 60000), // 5 requests per minute
    OtpMiddlewares.validateEmail,
    validateRequest(OtpValidations.sentOtpInEmail),
    OtpControllers.sentOTPInMail
  );

// Send OTP via Phone (with token) - with rate limiting and phone validation
router
  .route('/send-otp-via-token-in-phone')
  .post(
    OtpMiddlewares.otpRateLimit(5, 60000), // 5 requests per minute
    OtpMiddlewares.validatePhone,
    OtpControllers.sendOtpViaTokenInPhone
  );

// Send OTP via Direct Phone - with rate limiting and phone validation
router
  .route('/send-otp-via-direct-phone')
  .post(
    OtpMiddlewares.otpRateLimit(5, 60000), // 5 requests per minute
    OtpMiddlewares.validatePhone,
    validateRequest(OtpValidations.resentOtpInPhone),
    OtpControllers.sendOtpViaDirectPhone
  );

export const OtpRoutes = router;
