import { Request, Response, NextFunction } from 'express';
import { FlashcardService } from './flashcard.service';
import { CreateFlashcardRequest, UpdateFlashcardRequest, ListFlashcardsQuery, UpdateLearnedRequest } from './flashcard.schemas';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';

export class FlashcardController {
  private service: FlashcardService;

  constructor() {
    this.service = new FlashcardService();
  }

  async index(req: Request<{}, {}, {}, ListFlashcardsQuery>, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const flashcards = await this.service.getFlashcards(userId, req.query);
      res.status(200).json(flashcards);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request<{}, {}, CreateFlashcardRequest>, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const flashcard = await this.service.createFlashcard(userId, req.body);
      res.status(201).json({
        message: 'Cartão de estudo criado com sucesso',
        flashcard,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const id = req.params.id as string;
      const flashcard = await this.service.updateFlashcard(id, userId, req.body);
      res.status(200).json({
        message: 'Cartão de estudo atualizado com sucesso',
        flashcard,
      });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const id = req.params.id as string;
      await this.service.deleteFlashcard(id, userId);
      res.status(200).json({
        message: 'Cartão de estudo excluído com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async markLearned(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const id = req.params.id as string;
      const { learned } = req.body;
      const flashcard = await this.service.updateLearnedStatus(id, userId, learned);
      res.status(200).json({
        message: `Cartão marcado como ${learned ? 'aprendido' : 'revisar'}`,
        flashcard,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetLearned(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const id = req.params.id as string;
      const result = await this.service.resetDeck(id, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
