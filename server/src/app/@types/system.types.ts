import { REDIS_PREFIXES } from "@/app/constant";

export type TEnv = {
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_ACCESS_TOKEN_SECRET_KEY: string;
  JWT_REFRESH_TOKEN_SECRET_KEY: string;
  JWT_VERIFY_OTP_SECRET_KEY: string;
  JWT_ACCESS_EXPIRATION_TIME: string
  JWT_REFRESH_EXPIRATION_TIME: string
  JWT_OTP_EXPIRATION_TIME: string
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  OTP_HASH_SECRET: string;
  REDIS_HOST: string;
  REDIS_PASSWORD: string;
  REDIS_PORT: number;
  S3_ACCESS_KEY: string;
  S3_SECRET_KEY: string;
  S3_REGION: string;
  S3_BUCKET_NAME: string;
  // Additional env keys used across the codebase
  STRIPE_API_SECRET_KEY?: string;

  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;

  // Firebase-related envs
  FIREBASE_ACCOUNT_TYPE?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_PRIVATE_KEY_ID?: string;
  FIREBASE_PRIVATE_KEY?: string;
  FIREBASE_CLIENT_ID?: string;
  FIREBASE_AUTH_URI?: string;
  FIREBASE_TOKEN_URI?: string;
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL?: string;
  FIREBASE_CLIENT_X509_CERT_URL?: string;
  FIREBASE_UNIVERSE_DOMAIN?: string;
  FIREBASE_CLIENT_EMAIL?: string;
};

export type TMailOption = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export type TFirebaseCredentials = {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
  client_email: string;
};

export type TRedisPrefix = (typeof REDIS_PREFIXES)[keyof typeof REDIS_PREFIXES];

export type IErrorMessage = {
  path: string | number;
  message: string;
};

type TChannel = 'socket' | 'push' | 'both';

export interface INotificationPayload {
  userId: string;
  channel: TChannel;
  title: string;
  message: string;
  fcmToken?: string;
  data?: Record<string, any>;
}

export interface IBatchNotificationPayload {
  userIds: string[];
  fcmTokens?: string[];
  channel: TChannel;
  title: string;
  message: string;
  data?: Record<string, any>;
}