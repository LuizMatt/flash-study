import { prisma } from '../config/database';
import { logger } from '../config/logger';

export async function purgeExpiredRefreshTokens(now = new Date()) {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { revoked: true },
      ],
    },
  });

  logger.info({ deletedCount: result.count }, 'expired or revoked refresh tokens purged');
  return result.count;
}

if (require.main === module) {
  purgeExpiredRefreshTokens()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      logger.error({ err: error }, 'failed to purge refresh tokens');
      await prisma.$disconnect();
      process.exit(1);
    });
}

