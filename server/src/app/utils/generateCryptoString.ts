import crypto from 'node:crypto';

/**
 * Generates a crypto string in the format: #ST-XXXX (where XXXX is a random number of a specific length)
 * @param digitLength The length of the random number (e.g., passing 4 will generate something like 9421)
 */
export const generateCryptoString = (digitLength: number = 4): string => {
  const prefix = '#ST-';
  
  // If digitLength is 4, the range will be from 1000 to 9999
  const min = Math.pow(10, digitLength - 1);
  const max = Math.pow(10, digitLength) - 1;

  // Node's cryptographically secure random integer generator
  const randomNumber = crypto.randomInt(min, max + 1);

  return `${prefix}${randomNumber}`;
};
