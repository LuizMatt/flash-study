import { CategoryRepository } from './category.repository';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { ForbiddenError } from '../../shared/errors/ForbiddenError';
import { ConflictError } from '../../shared/errors/ConflictError';
import { CreateCategoryRequest, UpdateCategoryRequest } from './category.schemas';

export class CategoryService {
  private repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  async getCategories(userId: string) {
    return this.repository.findManyWithCounts(userId);
  }

  async getCategoryById(id: string, userId: string) {
    const category = await this.repository.findRawById(id);
    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    if (category.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para visualizar esta categoria');
    }

    return this.repository.findByIdAndUserId(id, userId);
  }

  async createCategory(userId: string, data: CreateCategoryRequest) {
    const existing = await this.repository.findByNameAndUserId(data.name, userId);
    if (existing) {
      throw new ConflictError('Você já possui uma categoria com este nome');
    }

    return this.repository.create({
      ...data,
      userId,
    });
  }

  async updateCategory(id: string, userId: string, data: UpdateCategoryRequest) {
    const category = await this.repository.findRawById(id);
    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    if (category.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para atualizar esta categoria');
    }

    if (data.name && data.name.toLowerCase() !== category.name.toLowerCase()) {
      const existing = await this.repository.findByNameAndUserId(data.name, userId);
      if (existing) {
        throw new ConflictError('Você já possui uma categoria com este nome');
      }
    }

    return this.repository.update(id, data);
  }

  async deleteCategory(id: string, userId: string) {
    const category = await this.repository.findRawById(id);
    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    if (category.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para excluir esta categoria');
    }

    await this.repository.delete(id);
  }
}
