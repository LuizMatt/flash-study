import { CategoryRepository } from '../category/category.repository';
import { AppError } from '../../shared/errors/AppError';
import { ForbiddenError } from '../../shared/errors/ForbiddenError';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { CreateReviewSessionRequest } from './reviewSession.schemas';
import { ReviewSessionRepository } from './reviewSession.repository';

export class ReviewSessionService {
  private repository: ReviewSessionRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.repository = new ReviewSessionRepository();
    this.categoryRepository = new CategoryRepository();
  }

  async createReviewSession(userId: string, data: CreateReviewSessionRequest) {
    const category = await this.categoryRepository.findRawById(data.categoryId);
    if (!category) {
      throw new NotFoundError('Categoria nao encontrada');
    }

    if (category.userId !== userId) {
      throw new ForbiddenError('Voce nao tem permissao para registrar revisoes nesta categoria');
    }

    if (data.correct > data.total) {
      throw new AppError(
        'Respostas corretas nao podem ser maiores que o total de cartoes revisados',
        400,
        'INVALID_REVIEW_SESSION',
      );
    }

    return this.repository.create({
      userId,
      categoryId: data.categoryId,
      total: data.total,
      correct: data.correct,
      date: data.date ?? new Date(),
    });
  }

  async getReviewSessions(userId: string) {
    return this.repository.findManyByUserId(userId);
  }
}

