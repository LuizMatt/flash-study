import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';

type RequestTarget = 'body' | 'params' | 'query';

export function validate(schema: ZodSchema, target: RequestTarget = 'body'): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const formatted = result.error!.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: formatted,
        },
      });
      return;
    }

    if (target === 'query') {
      Object.assign(req.query, result.data);
    } else {
      req[target] = result.data;
    }
    next();
  };
}
