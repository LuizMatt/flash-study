import { FlashcardService } from '../../src/modules/flashcard/flashcard.service';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';
import { ForbiddenError } from '../../src/shared/errors/ForbiddenError';

// Mock do FlashcardRepository
jest.mock('../../src/modules/flashcard/flashcard.repository', () => ({
  FlashcardRepository: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    resetLearnedStatus: jest.fn(),
  })),
}));

// Mock do CategoryRepository
jest.mock('../../src/modules/category/category.repository', () => ({
  CategoryRepository: jest.fn().mockImplementation(() => ({
    findRawById: jest.fn(),
  })),
}));

import { FlashcardRepository } from '../../src/modules/flashcard/flashcard.repository';
import { CategoryRepository } from '../../src/modules/category/category.repository';

describe('FlashcardService - Unit Tests', () => {
  let service: FlashcardService;
  let mockFlashcardRepo: any;
  let mockCategoryRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FlashcardService();
    mockFlashcardRepo = (FlashcardRepository as any).mock.results[0].value;
    mockCategoryRepo = (CategoryRepository as any).mock.results[0].value;
  });

  const userId = 'user-id-123';
  const otherUserId = 'user-id-456';
  const categoryId = 'category-uuid-1';
  const flashcardId = 'flashcard-uuid-1';

  const mockCategory = {
    id: categoryId,
    name: 'Inglês',
    userId,
  };

  const mockFlashcard = {
    id: flashcardId,
    categoryId,
    front: 'Hello',
    back: 'Olá',
    learned: false,
    category: {
      id: categoryId,
      userId,
    },
  };

  describe('getFlashcards', () => {
    it('deve listar flashcards sem filtros de categoria com sucesso', async () => {
      mockFlashcardRepo.findMany.mockResolvedValueOnce([mockFlashcard]);

      const result = await service.getFlashcards(userId, {});

      expect(result).toEqual([mockFlashcard]);
      expect(mockFlashcardRepo.findMany).toHaveBeenCalledWith({ userId });
    });

    it('deve listar flashcards filtrando por categoria válida pertencente ao usuário', async () => {
      mockCategoryRepo.findRawById.mockResolvedValueOnce(mockCategory);
      mockFlashcardRepo.findMany.mockResolvedValueOnce([mockFlashcard]);

      const result = await service.getFlashcards(userId, { categoryId });

      expect(result).toEqual([mockFlashcard]);
      expect(mockCategoryRepo.findRawById).toHaveBeenCalledWith(categoryId);
      expect(mockFlashcardRepo.findMany).toHaveBeenCalledWith({ userId, categoryId });
    });

    it('deve lançar NotFoundError se a categoria do filtro não existir', async () => {
      mockCategoryRepo.findRawById.mockResolvedValueOnce(null);

      await expect(service.getFlashcards(userId, { categoryId })).rejects.toThrow(NotFoundError);
      expect(mockFlashcardRepo.findMany).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenError se a categoria do filtro pertencer a outro usuário', async () => {
      const otherCategory = { ...mockCategory, userId: otherUserId };
      mockCategoryRepo.findRawById.mockResolvedValueOnce(otherCategory);

      await expect(service.getFlashcards(userId, { categoryId })).rejects.toThrow(ForbiddenError);
      expect(mockFlashcardRepo.findMany).not.toHaveBeenCalled();
    });
  });

  describe('createFlashcard', () => {
    const inputData = {
      categoryId,
      front: 'Book',
      back: 'Livro',
    };

    it('deve criar um flashcard com sucesso se a categoria pertencer ao usuário', async () => {
      mockCategoryRepo.findRawById.mockResolvedValueOnce(mockCategory);
      mockFlashcardRepo.create.mockResolvedValueOnce({
        id: 'new-card-id',
        ...inputData,
        learned: false,
      });

      const result = await service.createFlashcard(userId, inputData);

      expect(result.id).toBe('new-card-id');
      expect(mockCategoryRepo.findRawById).toHaveBeenCalledWith(categoryId);
      expect(mockFlashcardRepo.create).toHaveBeenCalledWith(inputData);
    });

    it('deve lançar NotFoundError se a categoria do novo flashcard não existir', async () => {
      mockCategoryRepo.findRawById.mockResolvedValueOnce(null);

      await expect(service.createFlashcard(userId, inputData)).rejects.toThrow(NotFoundError);
      expect(mockFlashcardRepo.create).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenError se a categoria do novo flashcard pertencer a outro usuário', async () => {
      const otherCategory = { ...mockCategory, userId: otherUserId };
      mockCategoryRepo.findRawById.mockResolvedValueOnce(otherCategory);

      await expect(service.createFlashcard(userId, inputData)).rejects.toThrow(ForbiddenError);
      expect(mockFlashcardRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateFlashcard', () => {
    const updateData = { front: 'Hello Word' };

    it('deve atualizar o flashcard com sucesso se pertencer ao usuário', async () => {
      mockFlashcardRepo.findById.mockResolvedValueOnce(mockFlashcard);
      mockFlashcardRepo.update.mockResolvedValueOnce({
        ...mockFlashcard,
        front: updateData.front,
      });

      const result = await service.updateFlashcard(flashcardId, userId, updateData);

      expect(result.front).toBe(updateData.front);
      expect(mockFlashcardRepo.findById).toHaveBeenCalledWith(flashcardId);
      expect(mockFlashcardRepo.update).toHaveBeenCalledWith(flashcardId, updateData);
    });

    it('deve lançar NotFoundError se o flashcard a atualizar não existir', async () => {
      mockFlashcardRepo.findById.mockResolvedValueOnce(null);

      await expect(service.updateFlashcard(flashcardId, userId, updateData)).rejects.toThrow(NotFoundError);
      expect(mockFlashcardRepo.update).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenError se o flashcard a atualizar pertencer a outro usuário', async () => {
      const otherFlashcard = {
        ...mockFlashcard,
        category: { id: categoryId, userId: otherUserId },
      };
      mockFlashcardRepo.findById.mockResolvedValueOnce(otherFlashcard);

      await expect(service.updateFlashcard(flashcardId, userId, updateData)).rejects.toThrow(ForbiddenError);
      expect(mockFlashcardRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteFlashcard', () => {
    it('deve excluir o flashcard com sucesso se pertencer ao usuário', async () => {
      mockFlashcardRepo.findById.mockResolvedValueOnce(mockFlashcard);
      mockFlashcardRepo.delete.mockResolvedValueOnce(mockFlashcard);

      await service.deleteFlashcard(flashcardId, userId);

      expect(mockFlashcardRepo.findById).toHaveBeenCalledWith(flashcardId);
      expect(mockFlashcardRepo.delete).toHaveBeenCalledWith(flashcardId);
    });

    it('deve lançar NotFoundError se o flashcard a excluir não existir', async () => {
      mockFlashcardRepo.findById.mockResolvedValueOnce(null);

      await expect(service.deleteFlashcard(flashcardId, userId)).rejects.toThrow(NotFoundError);
      expect(mockFlashcardRepo.delete).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenError se o flashcard a excluir pertencer a outro usuário', async () => {
      const otherFlashcard = {
        ...mockFlashcard,
        category: { id: categoryId, userId: otherUserId },
      };
      mockFlashcardRepo.findById.mockResolvedValueOnce(otherFlashcard);

      await expect(service.deleteFlashcard(flashcardId, userId)).rejects.toThrow(ForbiddenError);
      expect(mockFlashcardRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateLearnedStatus', () => {
    it('deve alterar status learned com sucesso se o flashcard pertencer ao usuário', async () => {
      mockFlashcardRepo.findById.mockResolvedValueOnce(mockFlashcard);
      mockFlashcardRepo.update.mockResolvedValueOnce({
        ...mockFlashcard,
        learned: true,
      });

      const result = await service.updateLearnedStatus(flashcardId, userId, true);

      expect(result.learned).toBe(true);
      expect(mockFlashcardRepo.findById).toHaveBeenCalledWith(flashcardId);
      expect(mockFlashcardRepo.update).toHaveBeenCalledWith(flashcardId, { learned: true });
    });
  });

  describe('resetDeck', () => {
    it('deve resetar o status de aprendizado de todos os flashcards da categoria se pertencer ao usuário', async () => {
      mockCategoryRepo.findRawById.mockResolvedValueOnce(mockCategory);
      mockFlashcardRepo.resetLearnedStatus.mockResolvedValueOnce({ count: 5 });

      const result = await service.resetDeck(categoryId, userId);

      expect(result.message).toContain('resetado com sucesso');
      expect(mockCategoryRepo.findRawById).toHaveBeenCalledWith(categoryId);
      expect(mockFlashcardRepo.resetLearnedStatus).toHaveBeenCalledWith(categoryId);
    });

    it('deve lançar NotFoundError ao tentar resetar categoria inexistente', async () => {
      mockCategoryRepo.findRawById.mockResolvedValueOnce(null);

      await expect(service.resetDeck(categoryId, userId)).rejects.toThrow(NotFoundError);
      expect(mockFlashcardRepo.resetLearnedStatus).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenError ao tentar resetar categoria de outro usuário', async () => {
      const otherCategory = { ...mockCategory, userId: otherUserId };
      mockCategoryRepo.findRawById.mockResolvedValueOnce(otherCategory);

      await expect(service.resetDeck(categoryId, userId)).rejects.toThrow(ForbiddenError);
      expect(mockFlashcardRepo.resetLearnedStatus).not.toHaveBeenCalled();
    });
  });
});
