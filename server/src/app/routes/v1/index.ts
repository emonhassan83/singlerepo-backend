import { Router } from 'express';

import { AuthRoutes } from '@/app/modules/auth/auth.routes';
import { NotificationRoutes } from '@/app/modules/notification/notification.routes';
import { OtpRoutes } from '@/app/modules/otp/otp.routes';
import { SettingsRoutes } from '@/app/modules/settings/settings.routes';
import { UploadRoutes } from '@/app/modules/upload/upload.routes';
import { UserRoutes } from '@/app/modules/user/user.routes';

const router = Router();

const apiRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/otp',
    route: OtpRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/upload',
    route: UploadRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/settings',
    route: SettingsRoutes,
  },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
