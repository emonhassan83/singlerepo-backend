export const REGISTER_WITH = {
  google: 'google',
  apple: 'apple',
  credentials: 'credentials',
} as const

export const registerWith = [
  REGISTER_WITH.google,
  REGISTER_WITH.apple,
  REGISTER_WITH.credentials,
]

export const USER_STATUS = {
  pending: 'pending',
  active: 'active',
  blocked: 'blocked',
} as const
 
export const USER_ROLE = {
  admin: 'admin',
  user: 'user',
} as const

export type IRegisterWith = keyof typeof REGISTER_WITH
export type IUserRole = keyof typeof USER_ROLE
export type IUserStatus = keyof typeof USER_STATUS
