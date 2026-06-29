export const corsWhiteList = [
  'http://localhost:5173',
  'http://localhost:3000'
];
export const SALT_ROUNDS = 12;
export const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
export const baseUrl = {
  v1: '/api/v1',
};
export const otpPageTokenExpireIn = '1d';
export const userLocationCacheExpireIn = '1d';
export const userAccessTokenExpiresIn = '30d';
export const adminAccessTokenExpiresIn = '15m';
export const refreshTokenExpiresInWithOutRememberMe = '3d';
export const refreshTokenExpiresInWithRememberMe = '30d';
export const otpExpireAt = 4;
export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_RADIUS_KM = 5;
export const EARTH_RADIUS_KM = 6371;
export const SUBSCRIPTION_FEATURE_CACHE_EXPIRY = '1d';

/**
 * ==============================================
 * ------------------REDIS KEYS------------------
 * ==============================================
 */

/**
 * ⚠️ DEVELOPER NOTICE: REDIS KEY PREFIXES
 *
 * Rules for adding new prefixes:
 * 1. DO NOT include a trailing colon (:) at the end of the string.
 * 2. The `createRedisKey` utility automatically manages colon separators.
 *
 * Adding a trailing colon here will cause broken keys like 'user:otp::12345'.
 */
export const REDIS_PREFIXES = {
  otp: 'user:otp',
  blacklist: 'blacklist:token',
  user: 'user',
  settings: 'settings',
  notification: 'notification',
  unreadNotification: 'user:unread:notification',
  session: 'session',
  rateLimit: 'rate:limit',
  contents: 'contents'
} as const;

export const OTP_GENERATE_CONFIG = {
  digits: true,
  lowerCaseAlphabets: false,
  specialChars: false,
  upperCaseAlphabets: false,
} as const;
