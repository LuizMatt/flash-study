import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';
import { generateAccessToken } from '../../src/shared/utils/generateToken';

describe('Review Session Routes - Integration Tests', () => {
  let userAId: string;
  let userBId: string;
  let tokenA: string;
  let tokenB: string;
  let categoryAId: string;
  let categoryBId: string;

  beforeAll(async () => {
    await prisma.reviewSession.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.flashcard.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});

    const userA = await prisma.user.create({
      data: {
        name: 'User A',
        email: `review-a-${Date.now()}@example.com`,
        passwordHash: 'hashed_password_a',
      },
    });

    const userB = await prisma.user.create({
      data: {
        name: 'User B',
        email: `review-b-${Date.now()}@example.com`,
        passwordHash: 'hashed_password_b',
      },
    });

    const categoryA = await prisma.category.create({
      data: {
        userId: userA.id,
        name: 'Programacao',
        color: '#00FF00',
        icon: 'code-slash-outline',
      },
    });

    const categoryB = await prisma.category.create({
      data: {
        userId: userB.id,
        name: 'Ingles',
        color: '#FF0000',
        icon: 'language-outline',
      },
    });

    userAId = userA.id;
    userBId = userB.id;
    categoryAId = categoryA.id;
    categoryBId = categoryB.id;
    tokenA = generateAccessToken(userA.id);
    tokenB = generateAccessToken(userB.id);
  });

  afterAll(async () => {
    await prisma.reviewSession.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.flashcard.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/review-sessions', () => {
    it('deve registrar sessao de revisao para categoria do usuario autenticado', async () => {
      const response = await request(app)
        .post('/api/review-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          categoryId: categoryAId,
          total: 10,
          correct: 7,
          date: '2026-06-24T10:00:00.000Z',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('session');
      expect(response.body.session.userId).toBe(userAId);
      expect(response.body.session.categoryId).toBe(categoryAId);
      expect(response.body.session.total).toBe(10);
      expect(response.body.session.correct).toBe(7);
      expect(response.body.session.category.name).toBe('Programacao');
    });

    it('deve retornar 400 quando acertos sao maiores que total', async () => {
      const response = await request(app)
        .post('/api/review-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          categoryId: categoryAId,
          total: 3,
          correct: 4,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_REVIEW_SESSION');
    });

    it('deve retornar 403 quando usuario tenta registrar revisao em categoria alheia', async () => {
      const response = await request(app)
        .post('/api/review-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          categoryId: categoryBId,
          total: 5,
          correct: 5,
        });

      expect(response.status).toBe(403);
    });

    it('deve retornar 400 para payload invalido', async () => {
      const response = await request(app)
        .post('/api/review-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          categoryId: 'invalid',
          total: -1,
          correct: 0,
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 401 quando nao autenticado', async () => {
      const response = await request(app)
        .post('/api/review-sessions')
        .send({
          categoryId: categoryAId,
          total: 1,
          correct: 1,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/review-sessions', () => {
    it('deve listar apenas historico do usuario autenticado em ordem cronologica', async () => {
      await request(app)
        .post('/api/review-sessions')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          categoryId: categoryBId,
          total: 2,
          correct: 2,
          date: '2026-06-23T10:00:00.000Z',
        });

      const response = await request(app)
        .get('/api/review-sessions')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(userAId);
      expect(response.body[0].categoryId).toBe(categoryAId);
    });

    it('deve retornar 401 quando nao autenticado', async () => {
      const response = await request(app).get('/api/review-sessions');

      expect(response.status).toBe(401);
    });
  });
});

