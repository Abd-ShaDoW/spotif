import { randomBytes } from 'crypto';

export const generateToken = (length: number = 32): string => {
  return randomBytes(length).toString('hex');
};
