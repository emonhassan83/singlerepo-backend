export const NOTIFICATION_MODEL_TYPE = {
  Auth: 'Auth',
  User : 'User',
  Payment: 'Payment',
} as const

export type INotificationModelType = keyof typeof NOTIFICATION_MODEL_TYPE
