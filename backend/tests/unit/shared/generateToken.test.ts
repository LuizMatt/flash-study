import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../../src/shared/utils/generateToken';
import { UnauthorizedError } from '../../../src/shared/errors/UnauthorizedError';

const TEST_USER_ID = 'user-uuid-1234';

describe('generateAccessToken', () => {
  it('should return a non-empty JWT string', () => {
    const token = generateAccessToken(TEST_USER_ID);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('should embed the userId as the `sub` claim', () => {
    const token = generateAccessToken(TEST_USER_ID);
    const decoded = jwt.decode(token) as { sub: string };
    expect(decoded.sub).toBe(TEST_USER_ID);
  });
});

describe('generateRefreshToken', () => {
  it('should return a non-empty JWT string', () => {
    const token = generateRefreshToken(TEST_USER_ID);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('should embed the userId as the `sub` claim', () => {
    const token = generateRefreshToken(TEST_USER_ID);
    const decoded = jwt.decode(token) as { sub: string };
    expect(decoded.sub).toBe(TEST_USER_ID);
  });
});

describe('verifyAccessToken', () => {
  it('should return the payload with the correct sub for a valid token', () => {
    const token = generateAccessToken(TEST_USER_ID);
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe(TEST_USER_ID);
  });

  it('should throw UnauthorizedError for an invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError when a refresh token is used as an access token', () => {
    const refreshToken = generateRefreshToken(TEST_USER_ID);
    expect(() => verifyAccessToken(refreshToken)).toThrow(UnauthorizedError);
  });
});

describe('verifyRefreshToken', () => {
  it('should return the payload with the correct sub for a valid token', () => {
    const token = generateRefreshToken(TEST_USER_ID);
    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe(TEST_USER_ID);
  });

  it('should throw UnauthorizedError for an invalid token', () => {
    expect(() => verifyRefreshToken('invalid.token.here')).toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError when an access token is used as a refresh token', () => {
    const accessToken = generateAccessToken(TEST_USER_ID);
    expect(() => verifyRefreshToken(accessToken)).toThrow(UnauthorizedError);
  });
});
