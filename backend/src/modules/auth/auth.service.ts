import { hashPassword, comparePassword } from '../../shared/utils/hashPassword';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/generateToken';
import { ConflictError } from '../../shared/errors/ConflictError';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';
import { authConfig } from '../../config/auth';
import { AuthRepository } from './auth.repository';
import { RegisterRequest, LoginRequest, RefreshRequest } from './auth.schemas';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async register(data: RegisterRequest) {
    // Verificar se e-mail já existe
    const existingUser = await this.repository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Este email já está registrado');
    }

    // Hash da senha
    const passwordHash = await hashPassword(data.password);

    // Criar usuário
    const user = await this.repository.createUser({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    // Gerar tokens
    const accessToken = generateAccessToken(user.id);
    const refreshTokenString = generateRefreshToken(user.id);

    const refreshTokenExpiresAt = new Date(
      Date.now() + authConfig.refreshExpiresInMs
    );

    // Salvar refresh token
    await this.repository.createRefreshToken({
      token: refreshTokenString,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      user,
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  async login(data: LoginRequest) {
    // Encontrar usuário
    const user = await this.repository.findUserWithPassword(data.email);
    if (!user) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    // Validar senha
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    // Gerar tokens
    const accessToken = generateAccessToken(user.id);
    const refreshTokenString = generateRefreshToken(user.id);

    const refreshTokenExpiresAt = new Date(
      Date.now() + authConfig.refreshExpiresInMs
    );

    // Salvar refresh token
    await this.repository.createRefreshToken({
      token: refreshTokenString,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  async refresh(data: RefreshRequest) {
    // Encontrar refresh token
    const refreshTokenRecord = await this.repository.findRefreshToken(data.refreshToken);
    if (!refreshTokenRecord || refreshTokenRecord.revoked) {
      throw new UnauthorizedError('Refresh token inválido ou expirado');
    }

    // Verificar se token expirou
    if (new Date() > refreshTokenRecord.expiresAt) {
      throw new UnauthorizedError('Refresh token expirado');
    }

    // Verificar token JWT
    try {
      verifyRefreshToken(data.refreshToken);
    } catch {
      throw new UnauthorizedError('Refresh token inválido');
    }

    // Encontrar usuário
    const user = await this.repository.findUserById(refreshTokenRecord.userId);
    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Implementar Token Rotation: revogar token antigo
    await this.repository.revokeRefreshToken(refreshTokenRecord.id);

    // Gerar novos tokens
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshTokenString = generateRefreshToken(user.id);

    const newRefreshTokenExpiresAt = new Date(
      Date.now() + authConfig.refreshExpiresInMs
    );

    // Salvar novo refresh token
    await this.repository.createRefreshToken({
      token: newRefreshTokenString,
      userId: user.id,
      expiresAt: newRefreshTokenExpiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
    };
  }

  async logout(userId: string) {
    // Revogar todos os refresh tokens do usuário
    await this.repository.revokeAllUserTokens(userId);
    return { message: 'Logout realizado com sucesso' };
  }
}
