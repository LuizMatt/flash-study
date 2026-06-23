import { UserRepository } from './user.repository';
import { hashPassword, comparePassword } from '../../shared/utils/hashPassword';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';
import { UpdateUserRequest } from './user.schemas';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async getProfile(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const stats = await this.repository.getUserStats(userId);

    return {
      user,
      stats,
    };
  }

  async updateProfile(userId: string, data: UpdateUserRequest) {
    const user = await this.repository.findUserWithPassword(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const updateData: { name?: string; passwordHash?: string } = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.password) {
      const isPasswordValid = await comparePassword(data.currentPassword!, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Senha atual incorreta');
      }

      updateData.passwordHash = await hashPassword(data.password);
    }

    // Apenas atualiza se houver campos para atualizar
    if (Object.keys(updateData).length === 0) {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return this.repository.updateUser(userId, updateData);
  }
}
