/**
 * Setup file for unit tests.
 *
 * Sets the minimum required environment variables so that src/config/env.ts
 * passes Zod validation without needing a real .env file or a running database.
 * Unit tests should mock any I/O (database, external services) themselves.
 */
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-8-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-8-chars';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';
