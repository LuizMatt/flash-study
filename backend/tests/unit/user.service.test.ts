import { UserService } from '../../src/modules/user/user.service';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';
import { UnauthorizedError } from '../../src/shared/errors/UnauthorizedError';

// Mock do UserRepository
jest.mock('../../src/modules/user/user.repository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findUserById: jest.fn(),
    findUserWithPassword: jest.fn(),
    updateUser: jest.fn(),
    getUserStats: jest.fn(),
  })),
}));

// Mock das utilidades de hash
jest.mock('../../src/shared/utils/hashPassword', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_new_password'),
  comparePassword: jest.fn(),
}));

import { UserRepository } from '../../src/modules/user/user.repository';
import { hashPassword, comparePassword } from '../../src/shared/utils/hashPassword';

describe('UserService - Unit Tests', () => {
  let service: UserService;
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
    mockRepository = (UserRepository as any).mock.results[0].value;
  });

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário e suas estatísticas de estudo com sucesso', async () => {
      const userId = 'user-id-123';
      const mockUser = {
        id: userId,
        name: 'Carlos Santos',
        email: 'carlos@example.com',
        createdAt: new Date(),
      };
      const mockStats = {
        totalDecks: 4,
        totalCards: 12,
        learnedCards: 7,
      };

      mockRepository.findUserById.mockResolvedValueOnce(mockUser);
      mockRepository.getUserStats.mockResolvedValueOnce(mockStats);

      const result = await service.getProfile(userId);

      expect(result.user).toEqual(mockUser);
      expect(result.stats).toEqual(mockStats);
      expect(mockRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockRepository.getUserStats).toHaveBeenCalledWith(userId);
    });

    it('deve lançar NotFoundError se o usuário não for encontrado', async () => {
      const userId = 'nonexistent-user-id';
      mockRepository.findUserById.mockResolvedValueOnce(null);

      await expect(service.getProfile(userId)).rejects.toThrow(NotFoundError);
      await expect(service.getProfile(userId)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('updateProfile', () => {
    const userId = 'user-id-123';
    const mockUser = {
      id: userId,
      name: 'Carlos Santos',
      email: 'carlos@example.com',
      passwordHash: 'old_password_hash',
      createdAt: new Date(),
    };

    it('deve atualizar apenas o nome do usuário com sucesso', async () => {
      const updateData = { name: 'Carlos Santos Editado' };
      const updatedUser = {
        id: userId,
        name: updateData.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      };

      mockRepository.findUserWithPassword.mockResolvedValueOnce(mockUser);
      mockRepository.updateUser.mockResolvedValueOnce(updatedUser);

      const result = await service.updateProfile(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.updateUser).toHaveBeenCalledWith(userId, { name: updateData.name });
      expect(hashPassword).not.toHaveBeenCalled();
    });

    it('deve atualizar a senha do usuário com sucesso se a senha atual for correta', async () => {
      const updateData = {
        password: 'NewPassword@123',
        currentPassword: 'OldPassword@123',
      };
      const updatedUser = {
        id: userId,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      };

      mockRepository.findUserWithPassword.mockResolvedValueOnce(mockUser);
      (comparePassword as jest.Mock).mockResolvedValueOnce(true);
      mockRepository.updateUser.mockResolvedValueOnce(updatedUser);

      const result = await service.updateProfile(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(comparePassword).toHaveBeenCalledWith(updateData.currentPassword, mockUser.passwordHash);
      expect(hashPassword).toHaveBeenCalledWith(updateData.password);
      expect(mockRepository.updateUser).toHaveBeenCalledWith(userId, { passwordHash: 'hashed_new_password' });
    });

    it('deve lançar UnauthorizedError se a senha atual informada estiver incorreta', async () => {
      const updateData = {
        password: 'NewPassword@123',
        currentPassword: 'WrongOldPassword@123',
      };

      mockRepository.findUserWithPassword.mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.updateProfile(userId, updateData)).rejects.toThrow(UnauthorizedError);
      await expect(service.updateProfile(userId, updateData)).rejects.toThrow('Senha atual incorreta');
      expect(mockRepository.updateUser).not.toHaveBeenCalled();
    });

    it('deve retornar o usuário inalterado se nenhum campo for enviado para atualização', async () => {
      mockRepository.findUserWithPassword.mockResolvedValueOnce(mockUser);

      const result = await service.updateProfile(userId, {});

      const { passwordHash, ...expectedUser } = mockUser;
      expect(result).toEqual(expectedUser);
      expect(mockRepository.updateUser).not.toHaveBeenCalled();
    });
  });
});
