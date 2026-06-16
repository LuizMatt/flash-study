import jwt, { SignOptions } from 'jsonwebtoken';
import { authConfig } from '../../config/auth';
import { UnauthorizedError } from '../errors/UnauthorizedError';

interface TokenPayload {
  sub: string;
}

export function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, authConfig.accessSecret, {
    expiresIn: authConfig.accessExpiresIn,
  } as SignOptions);
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, authConfig.refreshSecret, {
    expiresIn: authConfig.refreshExpiresIn,
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, authConfig.accessSecret) as TokenPayload;
    return payload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, authConfig.refreshSecret) as TokenPayload;
    return payload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}
