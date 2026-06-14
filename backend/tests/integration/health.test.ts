import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';

describe('GET /health', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 when database is connected', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('database', 'connected');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return 500 when database is disconnected', async () => {
    // Mock queryRaw to throw an error
    jest.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('Connection failed'));

    const response = await request(app).get('/health');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('database', 'disconnected');
    expect(response.body).toHaveProperty('error');
  });
});
