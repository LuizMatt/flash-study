import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    logger.info(
      {
        req: {
          method: req.method,
          url: req.originalUrl,
          route: req.route?.path,
          userId: req.userId,
          ip: req.ip,
        },
        res: {
          statusCode: res.statusCode,
        },
        durationMs: Math.round(durationMs * 100) / 100,
      },
      'request completed',
    );
  });

  next();
}

