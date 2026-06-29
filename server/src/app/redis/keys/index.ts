import { REDIS_PREFIXES } from '@/app/constant';
import { createRedisKey } from '@/app/utils/system.utils';

export const REDIS_KEYS = {
  CONTENTS: createRedisKey('contents', 'cache'),

  UNREAD_NOTIFICATION: (userId: string) => createRedisKey(REDIS_PREFIXES.unreadNotification, userId),

  REGISTER_OTP: (email: string) => createRedisKey(REDIS_PREFIXES.otp, email),
  RESET_OTP: (email: string) => createRedisKey(REDIS_PREFIXES.otp, 'reset', email),

  SETTINGS_SINGLE: (key: string) => createRedisKey(REDIS_PREFIXES.settings, key),
  SETTINGS_GENERALS: createRedisKey(REDIS_PREFIXES.settings, 'generals')
} as const;
