import { CategoryService } from '../../src/modules/category/category.service';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';
import { ForbiddenError } from '../../src/shared/errors/ForbiddenError';
import { ConflictError } from '../../src/shared/errors/ConflictError';

// Mock do CategoryRepository
jest.mock('../../src/modules/category/category.repository', () => ({
  CategoryRepository: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findRawById: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByIdAndUserId: jest.fn(),
    findManyWithCounts: jest.fn(),
  })),
}));

import { CategoryRepository } from '../../src/modules/category/category.repository';

describe('CategoryService - Unit Tests', () => {
  let service: CategoryService;
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoryService();
    mockRepository = (CategoryRepository as any).mock.results[0].value;
  });

  const userId = 'user-id-123';
  const otherUserId = 'user-id-456';
  const categoryId = 'category-uuid-1';

  const mockCategory = {
    id: categoryId,
    name: 'Programação',
    color: '#00ff00',
    icon: 'code-slash-outline',
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('getCategories', () => {
    it('deve listar categorias do usuário autenticado', async () => {
      const mockList = [
        { ...mockCategory, totalCards: 5, learnedCards: 2 },
      ];
      mockRepository.findManyWithCounts.mockResolvedValueOnce(mockList);

      const result = await service.getCategories(userId);

      expect(result).toEqual(mockList);
      expect(mockRepository.findManyWithCounts).toHaveBeenCalledWith(userId);
    });
  });

  describe('getCategoryById', () => {
    it('deve retornar categoria se ela existir e pertencer ao usuário', async () => {
      const mockResult = { ...mockCategory, totalCards: 5, learnedCards: 2 };
      mockRepository.findRawById.mockResolvedValueOnce(mockCategory);
      mockRepository.findByIdAndUserId.mockResolvedValueOnce(mockResult);

      const result = await service.getCategoryById(categoryId, userId);

      expect(result).toEqual(mockResult);
      expect(mockRepository.findRawById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.findByIdAndUserId).toHaveBeenCalledWith(categoryId, userId);
    });

    it('deve lançar NotFoundError se a categoria não existir', async () => {
      mockRepository.findRawById.mockResolvedValueOnce(null);

      await expect(service.getCategoryById(categoryId, userId)).rejects.toThrow(NotFoundError);
      expect(mockRepository.findByIdAndUserId).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenError se a categoria pertencer a outro usuário', async () => {
      const otherUserCategory = { ...mockCategory, userId: otherUserId };
      mockRepository.findRawById.mockResolvedValueOnce(otherUserCategory);

      await expect(service.getCategoryById(categoryId, userId)).rejects.toThrow(ForbiddenError);
      expect(mockRepository.findByIdAndUserId).not.toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    const inputData = {
      name: 'Inglês',
      color: '#ffffff',
      icon: 'language-outline' as const,
    };

    it('deve criar uma nova categoria com sucesso se o nome for exclusivo para o usuário', async () => {
      mockRepository.findByNameAndUserId.mockResolvedValueOnce(null);
      mockRepository.create.mockResolvedValueOnce({
        id: 'new-id',
        ...inputData,
        userId,
      });

      const result = await service.createCategory(userId, inputData);

      expect(result.id).toBe('new-id');
      expect(mockRepository.findByNameAndUserId).toHaveBeenCalledWith(inputData.name, userId);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...inputData,
        userId,
      });
    });

    it('deve lançar ConflictError se já existir categoria com o mesmo nome para o mesmo usuário', async () => {
      mockRepository.findByNameAndUserId.mockResolvedValueOnce(mockCategory);

      await expect(service.createCategory(userId, inputData)).rejects.toThrow(ConflictError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    const updateData = { name: 'Programação Editada' };

    it('deve atualizar categoria com sucesso se pertencer ao usuário e nome for exclusivo', async () => {
      mockRepository.findRawById.mockResolvedValueOnce(mockCategory);
      mockRepository.findByNameAndUserId.mockResolvedValueOnce(null);
      mockRepository.update.mockResolvedValueOnce({
        ...mockCategory,
        name: updateData.name,
      });

      const result = await service.updateCategory(categoryId, userId, updateData);

      expect(result.name).toBe(updateData.name);
      expect(mockRepository.findRawById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.update).toHaveBeenCalledWith(categoryId, updateData);
    });

    it('deve lançar NotFoundError se categoria a atualizar não existir', async () => {
      mockRepository.findRawById.mockResolvedValueOnce(null);

      await expect(service.updateCategory(categoryId, userId, updateData)).rejects.toThrow(NotFoundError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenError se categoria a atualizar pertencer a outro usuário', async () => {
      const otherUserCategory = { ...mockCategory, userId: otherUserId };
      mockRepository.findRawById.mockResolvedValueOnce(otherUserCategory);

      await expect(service.updateCategory(categoryId, userId, updateData)).rejects.toThrow(ForbiddenError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictError se tentar renomear para um nome de categoria que o usuário já possui', async () => {
      mockRepository.findRawById.mockResolvedValueOnce(mockCategory);
      mockRepository.findByNameAndUserId.mockResolvedValueOnce({
        id: 'another-cat-id',
        name: updateData.name,
        userId,
      });

      await expect(service.updateCategory(categoryId, userId, updateData)).rejects.toThrow(ConflictError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('deve deletar categoria com sucesso se pertencer ao usuário', async () => {
      mockRepository.findRawById.mockResolvedValueOnce(mockCategory);
      mockRepository.delete.mockResolvedValueOnce(mockCategory);

      await service.deleteCategory(categoryId, userId);

      expect(mockRepository.findRawById).toHaveBeenCalledWith(categoryId);
      expect(mockRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('deve lançar NotFoundError se a categoria a excluir não existir', async () => {
      mockRepository.findRawById.mockResolvedValueOnce(null);

      await expect(service.deleteCategory(categoryId, userId)).rejects.toThrow(NotFoundError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenError se a categoria a excluir pertencer a outro usuário', async () => {
      const otherUserCategory = { ...mockCategory, userId: otherUserId };
      mockRepository.findRawById.mockResolvedValueOnce(otherUserCategory);

      await expect(service.deleteCategory(categoryId, userId)).rejects.toThrow(ForbiddenError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
