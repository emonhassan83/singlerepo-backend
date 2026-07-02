export const GENERAL_KEYS = [
  // platform info
  'supportContract',
  'supportEmail',
] as const;

export const ALLOWED_KEYS = [
  ...GENERAL_KEYS,
  'userTramsAndCondition',
  'providerTramsAndCondition',
] as const;
