import { Router } from 'express';
import { FlashcardController } from './flashcard.controller';
import { validate } from '../../middlewares/validate';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  createFlashcardSchema,
  updateFlashcardSchema,
  listFlashcardsQuerySchema,
  updateLearnedSchema,
} from './flashcard.schemas';

const router = Router();
const controller = new FlashcardController();

// GET /api/flashcards - Listar flashcards do usuário com filtros (categoria e status learned)
router.get(
  '/flashcards',
  authMiddleware,
  validate(listFlashcardsQuerySchema, 'query'),
  (req, res, next) => controller.index(req, res, next)
);

// POST /api/flashcards - Criar novo flashcard
router.post(
  '/flashcards',
  authMiddleware,
  validate(createFlashcardSchema),
  (req, res, next) => controller.create(req, res, next)
);

// PATCH /api/flashcards/:id - Atualizar frente/verso do flashcard
router.patch(
  '/flashcards/:id',
  authMiddleware,
  validate(updateFlashcardSchema),
  (req, res, next) => controller.update(req, res, next)
);

// DELETE /api/flashcards/:id - Excluir flashcard
router.delete(
  '/flashcards/:id',
  authMiddleware,
  (req, res, next) => controller.destroy(req, res, next)
);

// PATCH /api/flashcards/:id/learned - Marcar flashcard como aprendido ou não aprendido
router.patch(
  '/flashcards/:id/learned',
  authMiddleware,
  validate(updateLearnedSchema),
  (req, res, next) => controller.markLearned(req, res, next)
);

// POST /api/categories/:id/reset-learned - Resetar status de aprendizado de todos os flashcards da categoria
router.post(
  '/categories/:id/reset-learned',
  authMiddleware,
  (req, res, next) => controller.resetLearned(req, res, next)
);

export default router;
