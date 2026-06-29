import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes';
import userRouter from '../modules/user/user.routes';
import categoryRouter from '../modules/category/category.routes';
import flashcardRouter from '../modules/flashcard/flashcard.routes';
import reviewSessionRouter from '../modules/reviewSession/reviewSession.routes';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRouter);

// Rotas de usuário
router.use('/me', userRouter);

// Rotas de categorias
router.use('/categories', categoryRouter);

// Rotas de flashcards (e rota de reset-learned de categorias)
router.use('/', flashcardRouter);

// Rotas de sessoes de revisao
router.use('/review-sessions', reviewSessionRouter);

export { router };

