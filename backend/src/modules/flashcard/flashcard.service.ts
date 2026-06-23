import { FlashcardRepository } from './flashcard.repository';
import { CategoryRepository } from '../category/category.repository';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { ForbiddenError } from '../../shared/errors/ForbiddenError';
import { CreateFlashcardRequest, UpdateFlashcardRequest } from './flashcard.schemas';

export class FlashcardService {
  private repository: FlashcardRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.repository = new FlashcardRepository();
    this.categoryRepository = new CategoryRepository();
  }

  async getFlashcards(userId: string, filters: { categoryId?: string; learned?: boolean }) {
    if (filters.categoryId) {
      const category = await this.categoryRepository.findRawById(filters.categoryId);
      if (!category) {
        throw new NotFoundError('Categoria não encontrada');
      }

      if (category.userId !== userId) {
        throw new ForbiddenError('Você não tem permissão para acessar os cartões desta categoria');
      }
    }

    return this.repository.findMany({ userId, ...filters });
  }

  async createFlashcard(userId: string, data: CreateFlashcardRequest) {
    const category = await this.categoryRepository.findRawById(data.categoryId);
    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    if (category.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para adicionar cartões a esta categoria');
    }

    return this.repository.create(data);
  }

  async updateFlashcard(id: string, userId: string, data: UpdateFlashcardRequest) {
    const flashcard = await this.repository.findById(id);
    if (!flashcard) {
      throw new NotFoundError('Cartão de estudo não encontrado');
    }

    if (flashcard.category.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para atualizar este cartão');
    }

    return this.repository.update(id, data);
  }

  async deleteFlashcard(id: string, userId: string) {
    const flashcard = await this.repository.findById(id);
    if (!flashcard) {
      throw new NotFoundError('Cartão de estudo não encontrado');
    }

    if (flashcard.category.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para excluir este cartão');
    }

    await this.repository.delete(id);
  }

  async updateLearnedStatus(id: string, userId: string, learned: boolean) {
    const flashcard = await this.repository.findById(id);
    if (!flashcard) {
      throw new NotFoundError('Cartão de estudo não encontrado');
    }

    if (flashcard.category.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para alterar o progresso deste cartão');
    }

    return this.repository.update(id, { learned });
  }

  async resetDeck(categoryId: string, userId: string) {
    const category = await this.categoryRepository.findRawById(categoryId);
    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    if (category.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para resetar os cartões desta categoria');
    }

    await this.repository.resetLearnedStatus(categoryId);
    return {
      message: 'Status de aprendizado de todos os cartões resetado com sucesso',
    };
  }
}
