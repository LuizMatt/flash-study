import { Router } from 'express';
import { CategoryController } from './category.controller';
import { validate } from '../../middlewares/validate';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { createCategorySchema, updateCategorySchema } from './category.schemas';

const router = Router();
const controller = new CategoryController();

// GET /api/categories - Listar categorias do usuário com contagem de flashcards
router.get(
  '/',
  authMiddleware,
  (req, res, next) => controller.index(req, res, next)
);

// GET /api/categories/:id - Obter detalhes de uma categoria
router.get(
  '/:id',
  authMiddleware,
  (req, res, next) => controller.show(req, res, next)
);

// POST /api/categories - Criar nova categoria
router.post(
  '/',
  authMiddleware,
  validate(createCategorySchema),
  (req, res, next) => controller.create(req, res, next)
);

// PATCH /api/categories/:id - Atualizar categoria
router.patch(
  '/:id',
  authMiddleware,
  validate(updateCategorySchema),
  (req, res, next) => controller.update(req, res, next)
);

// DELETE /api/categories/:id - Excluir categoria (excluirá flashcards em cascata)
router.delete(
  '/:id',
  authMiddleware,
  (req, res, next) => controller.destroy(req, res, next)
);

export default router;
