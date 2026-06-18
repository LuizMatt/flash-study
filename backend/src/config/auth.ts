import { env } from './env';

/**
 * Converte uma string de duração (ex: '7d', '15m', '1h') em milissegundos.
 */
function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format: "${duration}". Use format like "15m", "1h", "7d".`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

export const authConfig = {
  accessSecret: env.JWT_ACCESS_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  /** Duração do refresh token em milissegundos (calculada a partir da string de duração) */
  refreshExpiresInMs: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN),
} as const;
