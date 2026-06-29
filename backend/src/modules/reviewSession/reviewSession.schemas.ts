import { z } from 'zod';

export const createReviewSessionSchema = z
  .object({
    categoryId: z.string().uuid('Categoria deve ser um UUID valido'),
    total: z
      .number()
      .int('Total de cartoes deve ser um numero inteiro')
      .nonnegative('Total de cartoes nao pode ser negativo'),
    correct: z
      .number()
      .int('Respostas corretas devem ser um numero inteiro')
      .nonnegative('Respostas corretas nao pode ser negativo'),
    date: z.coerce.date().optional(),
  })
  .strict();

export type CreateReviewSessionRequest = z.infer<typeof createReviewSessionSchema>;

