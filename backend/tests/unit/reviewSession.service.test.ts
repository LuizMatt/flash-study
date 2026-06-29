import { ReviewSessionService } from '../../src/modules/reviewSession/reviewSession.service';
import { AppError } from '../../src/shared/errors/AppError';
import { ForbiddenError } from '../../src/shared/errors/ForbiddenError';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';

jest.mock('../../src/modules/reviewSession/reviewSession.repository', () => ({
  ReviewSessionRepository: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    findManyByUserId: jest.fn(),
  })),
}));

jest.mock('../../src/modules/category/category.repository', () => ({
  CategoryRepository: jest.fn().mockImplementation(() => ({
    findRawById: jest.fn(),
  })),
}));

import { ReviewSessionRepository } from '../../src/modules/reviewSession/reviewSession.repository';
import { CategoryRepository } from '../../src/modules/category/category.repository';

describe('ReviewSessionService - Unit Tests', () => {
  let service: ReviewSessionService;
  let mockRepository: any;
  let mockCategoryRepository: any;

  const userId = 'user-id-123';
  const otherUserId = 'user-id-456';
  const categoryId = '11111111-1111-4111-8111-111111111111';
  const sessionDate = new Date('2026-06-24T10:00:00.000Z');

  const mockCategory = {
    id: categoryId,
    userId,
    name: 'Programacao',
    color: '#00FF00',
    icon: 'code-slash-outline',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReviewSessionService();
    mockRepository = (ReviewSessionRepository as any).mock.results[0].value;
    mockCategoryRepository = (CategoryRepository as any).mock.results[0].value;
  });

  describe('createReviewSession', () => {
    it('deve registrar sessao quando categoria pertence ao usuario', async () => {
      const input = {
        categoryId,
        total: 10,
        correct: 8,
        date: sessionDate,
      };
      const created = {
        id: 'session-id',
        userId,
        ...input,
      };

      mockCategoryRepository.findRawById.mockResolvedValueOnce(mockCategory);
      mockRepository.create.mockResolvedValueOnce(created);

      const result = await service.createReviewSession(userId, input);

      expect(result).toEqual(created);
      expect(mockCategoryRepository.findRawById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        categoryId,
        total: 10,
        correct: 8,
        date: sessionDate,
      });
    });

    it('deve usar data atual quando date nao for informado', async () => {
      jest.useFakeTimers().setSystemTime(sessionDate);
      mockCategoryRepository.findRawById.mockResolvedValueOnce(mockCategory);
      mockRepository.create.mockResolvedValueOnce({ id: 'session-id' });

      await service.createReviewSession(userId, {
        categoryId,
        total: 4,
        correct: 4,
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        categoryId,
        total: 4,
        correct: 4,
        date: sessionDate,
      });

      jest.useRealTimers();
    });

    it('deve lancar NotFoundError quando categoria nao existe', async () => {
      mockCategoryRepository.findRawById.mockResolvedValueOnce(null);

      await expect(
        service.createReviewSession(userId, {
          categoryId,
          total: 10,
          correct: 8,
        }),
      ).rejects.toThrow(NotFoundError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve lancar ForbiddenError quando categoria pertence a outro usuario', async () => {
      mockCategoryRepository.findRawById.mockResolvedValueOnce({
        ...mockCategory,
        userId: otherUserId,
      });

      await expect(
        service.createReviewSession(userId, {
          categoryId,
          total: 10,
          correct: 8,
        }),
      ).rejects.toThrow(ForbiddenError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve rejeitar acertos maiores que o total revisado', async () => {
      mockCategoryRepository.findRawById.mockResolvedValueOnce(mockCategory);

      await expect(
        service.createReviewSession(userId, {
          categoryId,
          total: 5,
          correct: 6,
        }),
      ).rejects.toThrow(AppError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getReviewSessions', () => {
    it('deve listar sessoes do usuario em ordem definida pelo repositorio', async () => {
      const sessions = [{ id: 'session-id', userId, categoryId, total: 10, correct: 8 }];
      mockRepository.findManyByUserId.mockResolvedValueOnce(sessions);

      const result = await service.getReviewSessions(userId);

      expect(result).toEqual(sessions);
      expect(mockRepository.findManyByUserId).toHaveBeenCalledWith(userId);
    });
  });
});

