import { Router } from 'express';

import { NotificationControllers } from './notification.controllers';

import auth from '@/app/middlewares/auth';
import { USER_ROLE } from '@/app/modules/user/user.constant';

const router = Router();

router.post('/', NotificationControllers.createNotification);

router.delete(
  '/my-notifications',
  auth(USER_ROLE.admin, USER_ROLE.user),
  NotificationControllers.deleteAllNotifications
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.user),
  NotificationControllers.deleteANotification
);

router.patch(
  '/seen',
  auth(USER_ROLE.admin, USER_ROLE.user),
  NotificationControllers.markAsDoneNotification
);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.user),
  NotificationControllers.getAllNotifications
);

export const NotificationRoutes = router;
