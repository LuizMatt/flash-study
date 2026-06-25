import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './config/logger';

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
      healthcheckUrl: `http://localhost:${env.PORT}/health`,
    },
    'server started',
  );
});

const gracefulShutdown = async (signal: string) => {
  logger.info({ signal }, 'starting graceful shutdown');

  server.close(async () => {
    logger.info('express server closed');
    await prisma.$disconnect();
    logger.info('prisma client disconnected');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

