import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../../src/middlewares/authMiddleware';
import { generateAccessToken } from '../../../src/shared/utils/generateToken';
import { UnauthorizedError } from '../../../src/shared/errors/UnauthorizedError';

const TEST_USER_ID = 'user-uuid-5678';

function makeReq(authHeader?: string): Partial<Request> {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  } as Partial<Request>;
}

const res = {} as Response;
const next: NextFunction = jest.fn();

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() and set req.userId for a valid Bearer token', () => {
    const token = generateAccessToken(TEST_USER_ID);
    const req = makeReq(`Bearer ${token}`);

    authMiddleware(req as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe(TEST_USER_ID);
  });

  it('should throw UnauthorizedError when the Authorization header is missing', () => {
    const req = makeReq();

    expect(() => authMiddleware(req as Request, res, next)).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when the header does not start with Bearer', () => {
    const req = makeReq('Basic sometoken');

    expect(() => authMiddleware(req as Request, res, next)).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError for a malformed token', () => {
    const req = makeReq('Bearer this.is.invalid');

    expect(() => authMiddleware(req as Request, res, next)).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });
});
