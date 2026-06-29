import { Router } from 'express';
import { UserController } from './user.controller';
import { validate } from '../../middlewares/validate';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { updateUserSchema } from './user.schemas';

const router = Router();
const controller = new UserController();

// GET /api/me - Obter dados do perfil e estatísticas do usuário
router.get(
  '/',
  authMiddleware,
  (req, res, next) => controller.getMe(req, res, next)
);

// PATCH /api/me - Atualizar dados do perfil (nome e/ou senha)
router.patch(
  '/',
  authMiddleware,
  validate(updateUserSchema),
  (req, res, next) => controller.updateMe(req, res, next)
);

export default router;
