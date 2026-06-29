import { Router } from 'express';

import { AuthControllers } from './auth.controllers';
import { checkDuplicateUser } from './auth.middlewares';
import { AuthValidation } from './auth.validators';

import validateRequest from '@/app/utils/validateRequest';

const router = Router();

// ─── Signup ────────────────────────────────────────────────────────────────

router
  .route('/signup-with-email')
  .post(
    validateRequest(AuthValidation.signupWithEmailSchema),
    checkDuplicateUser,
    AuthControllers.signupWithEmail
  );

router
  .route('/signup-with-phone')
  .post(
    validateRequest(AuthValidation.signupWithPhoneSchema),
    checkDuplicateUser,
    AuthControllers.signupWithPhone
  );

// ─── Social Auth ───────────────────────────────────────────────────────────

router
  .route('/google')
  .post(
    validateRequest(AuthValidation.googleZodValidationSchema),
    AuthControllers.registerWithGoogle
  );

router
  .route('/apple')
  .post(
    validateRequest(AuthValidation.appleZodValidationSchema),
    AuthControllers.registerWithApple
  );

// ─── Login ─────────────────────────────────────────────────────────────────

router
  .route('/login-with-email')
  .post(
    validateRequest(AuthValidation.loginValidationSchema),
    AuthControllers.loginWithEmail
  );

router
  .route('/login-with-phone')
  .post(
    validateRequest(AuthValidation.loginWithPhoneValidationSchema),
    AuthControllers.loginWithPhone
  );

// ─── Password ──────────────────────────────────────────────────────────────

router
  .route('/forgot-password')
  .post(
    validateRequest(AuthValidation.forgotPasswordValidationSchema),
    AuthControllers.forgotPassword
  );

router
  .route('/reset-password')
  .post(
    validateRequest(AuthValidation.resetPasswordValidationSchema),
    AuthControllers.resetPassword
  );

router
  .route('/change-password')
  .post(
    validateRequest(AuthValidation.changePasswordValidationSchema),
    AuthControllers.changePassword
  );

// ─── Session ───────────────────────────────────────────────────────────────

router.route('/logout').post(AuthControllers.logoutUser);

router.route('/refresh-token').post(AuthControllers.refreshToken);

export const AuthRoutes = router;
