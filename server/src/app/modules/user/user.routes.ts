import { Router } from 'express';

import { UserControllers } from './user.controllers';
import { UserValidation } from './user.validation';

import auth from '@/app/middlewares/auth';
import { USER_ROLE } from './user.constant';
import validateRequest from '@/app/utils/validateRequest';

const router = Router();

// ─── Admin ─────────────────────────────────────────────────────────────────

router.get('/', auth(USER_ROLE.admin), UserControllers.getAllUsers);

// ─── Profile ───────────────────────────────────────────────────────────────

router.put(
  '/change-email',
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(UserValidation.changeEmailZodSchema),
  UserControllers.changedEmail
);

router.put(
  '/location',
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(UserValidation.updateLocationValidationSchema),
  UserControllers.updateMyLocation
);

// ─── User by ID ────────────────────────────────────────────────────────────

router
  .route('/:userId')
  .get(auth(USER_ROLE.user, USER_ROLE.admin), UserControllers.getAUser)
  .put(
    auth(USER_ROLE.user, USER_ROLE.admin),
    validateRequest(UserValidation.updateUserValidationSchema),
    UserControllers.updateUserProfile
  )
  .patch(
    auth(USER_ROLE.admin),
    validateRequest(UserValidation.changeStatusValidationSchema),
    UserControllers.updateUserStatus
  )
  .delete(auth(USER_ROLE.user, USER_ROLE.admin), UserControllers.deleteUserProfile);

export const UserRoutes = router;
