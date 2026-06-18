import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterRequest, LoginRequest, RefreshRequest } from './auth.schemas';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  async register(req: Request<{}, {}, RegisterRequest>, res: Response, next: NextFunction) {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json({
        message: 'Usuário registrado com sucesso',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request<{}, {}, LoginRequest>, res: Response, next: NextFunction) {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json({
        message: 'Login realizado com sucesso',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request<{}, {}, RefreshRequest>, res: Response, next: NextFunction) {
    try {
      const result = await this.service.refresh(req.body);
      res.status(200).json({
        message: 'Token renovado com sucesso',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      await this.service.logout(userId);
      res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}
