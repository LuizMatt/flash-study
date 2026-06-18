import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from './auth.schemas';

const router = Router();
const controller = new AuthController();

// POST /auth/register - Registrar novo usuário
router.post(
  '/register',
  validate(registerSchema),
  (req, res, next) => controller.register(req, res, next)
);

// POST /auth/login - Login
router.post(
  '/login',
  validate(loginSchema),
  (req, res, next) => controller.login(req, res, next)
);

// POST /auth/refresh - Renovar tokens
router.post(
  '/refresh',
  validate(refreshSchema),
  (req, res, next) => controller.refresh(req, res, next)
);

// POST /auth/logout - Logout (protegido)
router.post(
  '/logout',
  authMiddleware,
  (req, res, next) => controller.logout(req, res, next)
);

export default router;
