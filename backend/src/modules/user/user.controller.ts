import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { UpdateUserRequest } from './user.schemas';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const profile = await this.service.getProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request<{}, {}, UpdateUserRequest>, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const updatedUser = await this.service.updateProfile(userId, req.body);
      res.status(200).json({
        message: 'Perfil atualizado com sucesso',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
