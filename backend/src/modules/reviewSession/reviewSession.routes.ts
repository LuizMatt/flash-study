import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validate';
import { ReviewSessionController } from './reviewSession.controller';
import { createReviewSessionSchema } from './reviewSession.schemas';

const router = Router();
const controller = new ReviewSessionController();

router.get(
  '/',
  authMiddleware,
  (req, res, next) => controller.index(req, res, next),
);

router.post(
  '/',
  authMiddleware,
  validate(createReviewSessionSchema),
  (req, res, next) => controller.create(req, res, next),
);

export default router;

