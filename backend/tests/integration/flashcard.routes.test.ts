import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';
import { generateAccessToken } from '../../src/shared/utils/generateToken';

describe('Flashcard Routes - Integration Tests', () => {
  let userAId: string;
  let userBId: string;
  let tokenA: string;
  let tokenB: string;
  let categoryAId: string;
  let categoryBId: string;
  let flashcardAId: string;

  beforeAll(async () => {
    // Limpar dados anteriores
    await prisma.refreshToken.deleteMany({});
    await prisma.flashcard.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});

    // Criar Usuário A e Usuário B
    const userA = await prisma.user.create({
      data: {
        name: 'User A',
        email: `usera-${Date.now()}@example.com`,
        passwordHash: 'hashed_password_a',
      },
    });

    const userB = await prisma.user.create({
      data: {
        name: 'User B',
        email: `userb-${Date.now()}@example.com`,
        passwordHash: 'hashed_password_b',
      },
    });

    userAId = userA.id;
    userBId = userB.id;
    tokenA = generateAccessToken(userA.id);
    tokenB = generateAccessToken(userB.id);

    // Criar Categorias para os dois usuários
    const catA = await prisma.category.create({
      data: {
        name: 'React Native',
        color: '#00ff00',
        userId: userAId,
      },
    });

    const catB = await prisma.category.create({
      data: {
        name: 'Node.js',
        color: '#ff0000',
        userId: userBId,
      },
    });

    categoryAId = catA.id;
    categoryBId = catB.id;
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({});
    await prisma.flashcard.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/flashcards', () => {
    it('deve criar um novo flashcard na categoria pertencente ao Usuário A com sucesso', async () => {
      const response = await request(app)
        .post('/api/flashcards')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          categoryId: categoryAId,
          front: 'What is Expo?',
          back: 'A framework for React Native apps',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('flashcard');
      expect(response.body.flashcard.front).toBe('What is Expo?');
      flashcardAId = response.body.flashcard.id;
    });

    it('deve retornar 403 se o Usuário B tentar criar um flashcard na categoria do Usuário A', async () => {
      const response = await request(app)
        .post('/api/flashcards')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          categoryId: categoryAId,
          front: 'Tentativa',
          back: 'Invasao',
        });

      expect(response.status).toBe(403);
    });

    it('deve retornar 404 se a categoria informada não existir', async () => {
      const response = await request(app)
        .post('/api/flashcards')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          categoryId: '00000000-0000-0000-0000-000000000000',
          front: 'Categoria Fantasma',
          back: 'Inexistente',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/flashcards', () => {
    it('deve listar os flashcards do Usuário A com sucesso', async () => {
      const response = await request(app)
        .get('/api/flashcards')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(flashcardAId);
    });

    it('deve listar filtrando por categoria com sucesso', async () => {
      const response = await request(app)
        .get(`/api/flashcards?categoryId=${categoryAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    it('deve retornar 403 se o Usuário B tentar filtrar pela categoria do Usuário A', async () => {
      const response = await request(app)
        .get(`/api/flashcards?categoryId=${categoryAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/flashcards/:id', () => {
    it('deve atualizar o flashcard do Usuário A com sucesso', async () => {
      const response = await request(app)
        .patch(`/api/flashcards/${flashcardAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          front: 'What is React Native Expo?',
        });

      expect(response.status).toBe(200);
      expect(response.body.flashcard.front).toBe('What is React Native Expo?');
    });

    it('deve retornar 403 se o Usuário B tentar atualizar o flashcard do Usuário A', async () => {
      const response = await request(app)
        .patch(`/api/flashcards/${flashcardAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          front: 'Invasor front',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/flashcards/:id/learned', () => {
    it('deve marcar o flashcard como aprendido com sucesso', async () => {
      const response = await request(app)
        .patch(`/api/flashcards/${flashcardAId}/learned`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          learned: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.flashcard.learned).toBe(true);
    });

    it('deve retornar 403 se Usuário B tentar marcar flashcard do Usuário A como aprendido', async () => {
      const response = await request(app)
        .patch(`/api/flashcards/${flashcardAId}/learned`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          learned: false,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/categories/:id/reset-learned', () => {
    it('deve retornar 403 se o Usuário B tentar resetar os cards da categoria do Usuário A', async () => {
      const response = await request(app)
        .post(`/api/categories/${categoryAId}/reset-learned`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(response.status).toBe(403);
    });

    it('deve resetar o progresso dos cards da categoria com sucesso', async () => {
      const response = await request(app)
        .post(`/api/categories/${categoryAId}/reset-learned`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que o status learned foi resetado
      const checkResponse = await request(app)
        .get(`/api/categories/${categoryAId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkResponse.body.learnedCards).toBe(0);
    });
  });

  describe('DELETE /api/flashcards/:id', () => {
    it('deve retornar 403 se o Usuário B tentar excluir flashcard do Usuário A', async () => {
      const response = await request(app)
        .delete(`/api/flashcards/${flashcardAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(response.status).toBe(403);
    });

    it('deve excluir o flashcard com sucesso', async () => {
      const response = await request(app)
        .delete(`/api/flashcards/${flashcardAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);

      // Confirmar exclusão
      const checkRes = await request(app)
        .get(`/api/flashcards`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.body.length).toBe(0);
    });
  });
});
