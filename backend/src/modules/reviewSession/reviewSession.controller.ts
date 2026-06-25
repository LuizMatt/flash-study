import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';
import { CreateReviewSessionRequest } from './reviewSession.schemas';
import { ReviewSessionService } from './reviewSession.service';

export class ReviewSessionController {
  private service: ReviewSessionService;

  constructor() {
    this.service = new ReviewSessionService();
  }

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuario nao autenticado');
      }

      const sessions = await this.service.getReviewSessions(userId);
      res.status(200).json(sessions);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request<{}, {}, CreateReviewSessionRequest>, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuario nao autenticado');
      }

      const session = await this.service.createReviewSession(userId, req.body);
      res.status(201).json({
        message: 'Sessao de revisao registrada com sucesso',
        session,
      });
    } catch (error) {
      next(error);
    }
  }
}

