import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';

describe('Auth Routes - Integration Tests', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword@123';

  beforeAll(async () => {
    // Limpar dados de teste anteriores
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'João Silva',
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testEmail);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('deve retornar 409 se email já está registrado', async () => {
      const uniqueEmail = `duplicate-${Date.now()}@example.com`;

      // Primeiro registro
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'João Silva',
          email: uniqueEmail,
          password: testPassword,
        });

      // Segundo registro com mesmo email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Maria Silva',
          email: uniqueEmail,
          password: testPassword,
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('deve retornar 400 se email é inválido', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'João Silva',
          email: 'invalid-email',
          password: testPassword,
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 se senha é fraca', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'João Silva',
          email: 'weak-password@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 se nome está vazio', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'test@example.com',
          password: testPassword,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    const loginEmail = `login-test-${Date.now()}@example.com`;

    beforeAll(async () => {
      // Criar usuário para testes de login
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: loginEmail,
          password: testPassword,
        });
    });

    it('deve fazer login com sucesso', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(loginEmail);
    });

    it('deve retornar 401 se email não existe', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toHaveProperty('message');
    });

    it('deve retornar 401 se senha está incorreta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: 'WrongPassword@123',
        });

      expect(response.status).toBe(401);
    });

    it('deve retornar 400 se email está vazio', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: testPassword,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    const refreshEmail = `refresh-test-${Date.now()}@example.com`;
    let validRefreshToken: string;

    beforeAll(async () => {
      // Registrar usuário para testes de refresh
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Refresh Test User',
          email: refreshEmail,
          password: testPassword,
        });
    });

    beforeEach(async () => {
      // Fazer login para obter refresh token válido
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: refreshEmail,
          password: testPassword,
        });

      validRefreshToken = loginResponse.body.refreshToken;
    });

    it('deve renovar tokens com sucesso', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: validRefreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe('');
    });

    it('deve retornar 401 se refresh token é inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid_token',
        });

      expect(response.status).toBe(401);
    });

    it('deve retornar 400 se refresh token está vazio', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: '',
        });

      expect(response.status).toBe(400);
    });

    it('deve implementar token rotation (revogar token antigo)', async () => {
      // Primeiro refresh
      const firstRefresh = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: validRefreshToken,
        });

      expect(firstRefresh.status).toBe(200);
      const newRefreshToken = firstRefresh.body.refreshToken;

      // Tentar usar token antigo deve falhar
      const secondAttempt = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: validRefreshToken,
        });

      expect(secondAttempt.status).toBe(401);

      // Novo token deve funcionar
      const thirdAttempt = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: newRefreshToken,
        });

      expect(thirdAttempt.status).toBe(200);
    });
  });

  describe('POST /api/auth/logout', () => {
    const logoutEmail = `logout-test-${Date.now()}@example.com`;
    let testAccessToken: string;

    beforeAll(async () => {
      // Registrar usuário para testes de logout
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Logout Test User',
          email: logoutEmail,
          password: testPassword,
        });
    });

    beforeEach(async () => {
      // Fazer login para obter access token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: logoutEmail,
          password: testPassword,
        });

      testAccessToken = loginResponse.body.accessToken;
    });

    it('deve fazer logout com sucesso', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar 401 se não está autenticado', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });

    it('deve retornar 401 se token é inválido', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });

  describe('Fluxo completo de autenticação', () => {
    it('deve realizar fluxo completo: register -> login -> refresh -> logout', async () => {
      const email = `flow-test-${Date.now()}@example.com`;

      // 1. Registrar
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Flow Test User',
          email,
          password: testPassword,
        });

      expect(registerResponse.status).toBe(201);
      let currentRefreshToken = registerResponse.body.refreshToken;

      // 2. Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: testPassword,
        });

      expect(loginResponse.status).toBe(200);
      currentRefreshToken = loginResponse.body.refreshToken;

      // 3. Refresh
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: currentRefreshToken,
        });

      expect(refreshResponse.status).toBe(200);
      const newAccessToken = refreshResponse.body.accessToken;
      currentRefreshToken = refreshResponse.body.refreshToken;

      // 4. Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`);

      expect(logoutResponse.status).toBe(200);
    });
  });
});
