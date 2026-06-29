import { IUserRole } from "@/app/schemas/modules/user/user.constant";

export type TExpiresIn =
  | number
  | '30s'
  | '1m'
  | '5m'
  | '10m'
  | '1h'
  | '1d'
  | '7d'
  | '30d'
  | '365d';

  export interface TLoginWithEmail {
  email: string
  password: string
  fcmToken?: string
}

export interface TLoginWithPhone {
  phone: string
  fcmToken?: string
}

export interface TGoogleLoginPayload {
  name?: string
  email: string
  role?: IUserRole
  photoUrl?: string
  token?: string // Google auth token or ID token
  fcmToken?: string
}

export interface TAppleLoginPayload {
  name?: string
  email: string
  photoUrl?: string
  role?: IUserRole
  token?: string // Apple identity token
  fcmToken?: string
}
