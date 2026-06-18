import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRouter);


export { router };
