import { AuthService } from '../../src/modules/auth/auth.service';
import { ConflictError } from '../../src/shared/errors/ConflictError';
import { UnauthorizedError } from '../../src/shared/errors/UnauthorizedError';

// Mock do repositório
jest.mock('../../src/modules/auth/auth.repository', () => ({
  AuthRepository: jest.fn().mockImplementation(() => ({
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    findUserById: jest.fn(),
    findUserWithPassword: jest.fn(),
    createRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
    revokeAllUserTokens: jest.fn(),
  })),
}));

// Mock das utilities
jest.mock('../../src/shared/utils/hashPassword', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password'),
  comparePassword: jest.fn(),
}));

jest.mock('../../src/shared/utils/generateToken', () => ({
  generateAccessToken: jest.fn().mockReturnValue('mock_access_token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock_refresh_token'),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

import { AuthRepository } from '../../src/modules/auth/auth.repository';
import { hashPassword, comparePassword } from '../../src/shared/utils/hashPassword';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../src/shared/utils/generateToken';

describe('AuthService', () => {
  let service: AuthService;
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    mockRepository = (AuthRepository as any).mock.results[0].value;
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'Senha@123',
      };

      const newUser = {
        id: 'user-id-1',
        name: userData.name,
        email: userData.email,
        createdAt: new Date(),
      };

      mockRepository.findUserByEmail.mockResolvedValueOnce(null);
      mockRepository.createUser.mockResolvedValueOnce(newUser);
      mockRepository.createRefreshToken.mockResolvedValueOnce({
        id: 'token-id',
        token: 'mock_refresh_token',
        userId: newUser.id,
      });

      const result = await service.register(userData);

      expect(result.user).toEqual(newUser);
      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
      expect(mockRepository.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockRepository.createUser).toHaveBeenCalled();
      expect(hashPassword).toHaveBeenCalledWith(userData.password);
    });

    it('deve lançar ConflictError se email já está registrado', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'Senha@123',
      };

      mockRepository.findUserByEmail.mockResolvedValue({
        id: 'existing-user',
        email: userData.email,
      });

      await expect(service.register(userData)).rejects.toThrow(ConflictError);
      await expect(service.register(userData)).rejects.toThrow(
        'Este email já está registrado'
      );
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const loginData = {
        email: 'joao@example.com',
        password: 'Senha@123',
      };

      const user = {
        id: 'user-id-1',
        name: 'João Silva',
        email: loginData.email,
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };

      mockRepository.findUserWithPassword.mockResolvedValueOnce(user);
      (comparePassword as jest.Mock).mockResolvedValueOnce(true);
      mockRepository.createRefreshToken.mockResolvedValueOnce({
        id: 'token-id',
        token: 'mock_refresh_token',
      });

      const result = await service.login(loginData);

      expect(result.user).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
      expect(result.accessToken).toBe('mock_access_token');
      expect(comparePassword).toHaveBeenCalledWith(
        loginData.password,
        user.passwordHash
      );
    });

    it('deve lançar UnauthorizedError se usuário não existe', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Senha@123',
      };

      mockRepository.findUserWithPassword.mockResolvedValueOnce(null);

      await expect(service.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('deve lançar UnauthorizedError se senha está incorreta', async () => {
      const loginData = {
        email: 'joao@example.com',
        password: 'SenhaErrada@123',
      };

      const user = {
        id: 'user-id-1',
        name: 'João Silva',
        email: loginData.email,
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };

      mockRepository.findUserWithPassword.mockResolvedValueOnce(user);
      (comparePassword as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login(loginData)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refresh', () => {
    it('deve renovar tokens com sucesso', async () => {
      const refreshData = {
        refreshToken: 'valid_refresh_token',
      };

      const refreshTokenRecord = {
        id: 'token-id-1',
        token: refreshData.refreshToken,
        userId: 'user-id-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: false,
      };

      const user = {
        id: 'user-id-1',
        name: 'João Silva',
        email: 'joao@example.com',
        createdAt: new Date(),
      };

      mockRepository.findRefreshToken.mockResolvedValueOnce(refreshTokenRecord);
      mockRepository.findUserById.mockResolvedValueOnce(user);
      mockRepository.revokeRefreshToken.mockResolvedValueOnce({});
      mockRepository.createRefreshToken.mockResolvedValueOnce({
        token: 'new_refresh_token',
      });

      const result = await service.refresh(refreshData);

      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
      expect(mockRepository.revokeRefreshToken).toHaveBeenCalledWith(refreshTokenRecord.id);
      expect(verifyRefreshToken).toHaveBeenCalledWith(refreshData.refreshToken);
    });

    it('deve lançar UnauthorizedError se refresh token é inválido', async () => {
      const refreshData = {
        refreshToken: 'invalid_token',
      };

      mockRepository.findRefreshToken.mockResolvedValueOnce(null);

      await expect(service.refresh(refreshData)).rejects.toThrow(UnauthorizedError);
    });

    it('deve lançar UnauthorizedError se refresh token está revogado', async () => {
      const refreshData = {
        refreshToken: 'revoked_token',
      };

      const refreshTokenRecord = {
        id: 'token-id-1',
        token: refreshData.refreshToken,
        userId: 'user-id-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: true,
      };

      mockRepository.findRefreshToken.mockResolvedValueOnce(refreshTokenRecord);

      await expect(service.refresh(refreshData)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('logout', () => {
    it('deve fazer logout com sucesso', async () => {
      const userId = 'user-id-1';

      mockRepository.revokeAllUserTokens.mockResolvedValueOnce({});

      const result = await service.logout(userId);

      expect(result.message).toBe('Logout realizado com sucesso');
      expect(mockRepository.revokeAllUserTokens).toHaveBeenCalledWith(userId);
    });
  });
});
