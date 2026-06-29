import { hash, compare } from 'bcrypt';

import { SALT_ROUNDS } from '@/app/constant';

/**
 * Hash a plain password using bcrypt
 */
export async function hashPassword(passwordString: string): Promise<string> {
  try {
    return await hash(passwordString, SALT_ROUNDS);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unexpected Error Occurred In Hash Password Utils');
    }
  }
}

/**
 * Compare plain password with hashed password
 */
export async function comparePassword(
  requestedPassword: string,
  hashPassword: string
): Promise<boolean> {
  try {
    return await compare(requestedPassword, hashPassword);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unexpected Error Occurred In Compare Password Utils');
    }
  }
}
