import { Router } from 'express';

import { SettingController } from './settings.controller';
import { SettingValidation } from './settings.validation';

import auth from '@/app/middlewares/auth';
import { USER_ROLE } from '@/app/modules/user/user.constant';
import validateRequest from '@/app/utils/validateRequest';

const router = Router();

router.post(
  '/generals',
  validateRequest(SettingValidation.updateGeneralsZodSchema),
  SettingController.updateGenerals,
);

router.post(
  '/:key',
  auth(USER_ROLE.admin),
  validateRequest(SettingValidation.createOrUpdateSettingZodSchema),
  SettingController.createOrUpdate,
);

router.get('/', SettingController.getSetting);
router.get('/generals', SettingController.getSettingGenerals);

export const SettingsRoutes = router;
