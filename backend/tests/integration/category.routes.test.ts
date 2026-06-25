import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';
import { generateAccessToken } from '../../src/shared/utils/generateToken';

describe('Category Routes - Integration Tests', () => {
  let userAId: string;
  let userBId: string;
  let tokenA: string;
  let tokenB: string;
  let categoryAId: string;

  beforeAll(async () => {
    // Limpar dados anteriores
    await prisma.refreshToken.deleteMany({});
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
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/categories', () => {
    it('deve criar uma nova categoria com sucesso', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Programação',
          color: '#00FF00',
          icon: 'code-slash-outline',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('category');
      expect(response.body.category.name).toBe('Programação');
      categoryAId = response.body.category.id;
    });

    it('deve retornar 409 se criar categoria com mesmo nome para o mesmo usuário', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Programação',
          color: '#FF0000',
          icon: 'book-outline',
        });

      expect(response.status).toBe(409);
    });

    it('deve permitir criar categoria com mesmo nome para outro usuário', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          name: 'Programação',
          color: '#FF0000',
          icon: 'book-outline',
        });

      expect(response.status).toBe(201);
    });

    it('deve retornar 400 se a cor for inválida', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Nova Categoria',
          color: 'red',
          icon: 'book-outline',
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 se o ícone for inválido', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Nova Categoria',
          color: '#FFFFFF',
          icon: 'invalid-icon-name',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/categories', () => {
    it('deve listar categorias do Usuário A acompanhadas de contadores', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Programação');
      expect(response.body[0]).toHaveProperty('totalCards');
      expect(response.body[0]).toHaveProperty('learnedCards');
    });
  });

  describe('GET /api/categories/:id', () => {
    it('deve exibir detalhes da categoria se pertencer ao Usuário A', async () => {
      const response = await request(app)
        .get(`/api/categories/${categoryAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Programação');
      expect(response.body).toHaveProperty('totalCards', 0);
    });

    it('deve retornar 403 se o Usuário B tentar visualizar a categoria do Usuário A', async () => {
      const response = await request(app)
        .get(`/api/categories/${categoryAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(response.status).toBe(403);
    });

    it('deve retornar 404 se a categoria não existir', async () => {
      const response = await request(app)
        .get('/api/categories/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/categories/:id', () => {
    it('deve atualizar categoria do Usuário A com sucesso', async () => {
      const response = await request(app)
        .patch(`/api/categories/${categoryAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Programação Avançada',
        });

      expect(response.status).toBe(200);
      expect(response.body.category.name).toBe('Programação Avançada');
    });

    it('deve retornar 403 se Usuário B tentar atualizar categoria do Usuário A', async () => {
      const response = await request(app)
        .patch(`/api/categories/${categoryAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          name: 'Tentativa Invasão',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('deve retornar 403 se Usuário B tentar excluir categoria do Usuário A', async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(response.status).toBe(403);
    });

    it('deve excluir categoria do Usuário A com sucesso', async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);

      // Confirmar exclusão
      const checkRes = await request(app)
        .get(`/api/categories/${categoryAId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
