import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';
import { generateAccessToken } from '../../src/shared/utils/generateToken';
import { hashPassword } from '../../src/shared/utils/hashPassword';

describe('User Routes - Integration Tests', () => {
  let testUserId: string;
  let testAccessToken: string;
  const testEmail = `user-test-${Date.now()}@example.com`;
  const testPassword = 'Password@123';

  beforeAll(async () => {
    // Limpar dados anteriores
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});

    // Criar usuário de teste
    const hashedPassword = await hashPassword(testPassword);
    const user = await prisma.user.create({
      data: {
        name: 'Carlos Teste',
        email: testEmail,
        passwordHash: hashedPassword,
      },
    });

    testUserId = user.id;
    testAccessToken = generateAccessToken(user.id);
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /api/me', () => {
    it('deve retornar o perfil e estatísticas do usuário autenticado', async () => {
      const response = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.user.email).toBe(testEmail);
      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body.stats).toEqual({
        totalDecks: 0,
        totalCards: 0,
        learnedCards: 0,
      });
    });

    it('deve retornar 401 se a requisição não contiver token de acesso', async () => {
      const response = await request(app).get('/api/me');
      expect(response.status).toBe(401);
    });

    it('deve retornar 401 se o token for inválido', async () => {
      const response = await request(app)
        .get('/api/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/me', () => {
    it('deve atualizar o nome do usuário com sucesso', async () => {
      const response = await request(app)
        .patch('/api/me')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send({
          name: 'Carlos Nome Novo',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.name).toBe('Carlos Nome Novo');
      expect(response.body).toHaveProperty('message', 'Perfil atualizado com sucesso');
    });

    it('deve atualizar a senha com sucesso quando fornecida a senha atual correta', async () => {
      const response = await request(app)
        .patch('/api/me')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send({
          password: 'NewPassword@123',
          currentPassword: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Perfil atualizado com sucesso');
    });

    it('deve retornar 401 se tentar atualizar a senha com a senha atual incorreta', async () => {
      const response = await request(app)
        .patch('/api/me')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send({
          password: 'NewPassword@123',
          currentPassword: 'WrongPassword@123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toHaveProperty('message', 'Senha atual incorreta');
    });

    it('deve retornar 400 se tentar atualizar a senha sem fornecer a senha atual', async () => {
      const response = await request(app)
        .patch('/api/me')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send({
          password: 'NewPassword@123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
