process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/flashstudy';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-8-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-8-chars';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';
