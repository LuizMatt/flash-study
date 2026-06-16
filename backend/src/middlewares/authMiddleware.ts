import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../shared/utils/generateToken';
import { UnauthorizedError } from '../shared/errors/UnauthorizedError';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authorization header is missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  const payload = verifyAccessToken(token);
  req.userId = payload.sub;

  next();
}
