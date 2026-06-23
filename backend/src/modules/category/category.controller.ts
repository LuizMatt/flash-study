import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { CreateCategoryRequest, UpdateCategoryRequest } from './category.schemas';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';

export class CategoryController {
  private service: CategoryService;

  constructor() {
    this.service = new CategoryService();
  }

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const categories = await this.service.getCategories(userId);
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const { id } = req.params;
      const category = await this.service.getCategoryById(id, userId);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request<{}, {}, CreateCategoryRequest>, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const category = await this.service.createCategory(userId, req.body);
      res.status(201).json({
        message: 'Categoria criada com sucesso',
        category,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request<{ id: string }, {}, UpdateCategoryRequest>, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const { id } = req.params;
      const category = await this.service.updateCategory(id, userId, req.body);
      res.status(200).json({
        message: 'Categoria atualizada com sucesso',
        category,
      });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const { id } = req.params;
      await this.service.deleteCategory(id, userId);
      res.status(200).json({
        message: 'Categoria excluída com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
