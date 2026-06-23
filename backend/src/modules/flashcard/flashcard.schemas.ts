import { z } from 'zod';

export const createFlashcardSchema = z.object({
  categoryId: z
    .string()
    .uuid('ID de categoria inválido'),
  front: z
    .string()
    .min(1, 'Frente do cartão não pode estar em branco'),
  back: z
    .string()
    .min(1, 'Verso do cartão não pode estar em branco'),
});

export const updateFlashcardSchema = z.object({
  front: z
    .string()
    .min(1, 'Frente do cartão não pode estar em branco')
    .optional(),
  back: z
    .string()
    .min(1, 'Verso do cartão não pode estar em branco')
    .optional(),
});

export const listFlashcardsQuerySchema = z.object({
  categoryId: z
    .string()
    .uuid('ID de categoria inválido')
    .optional(),
  learned: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }, z.boolean())
    .optional(),
});

export const updateLearnedSchema = z.object({
  learned: z.boolean({
    required_error: 'Status de aprendizado é obrigatório (true/false)',
    invalid_type_error: 'Status de aprendizado deve ser um valor booleano',
  }),
});

export type CreateFlashcardRequest = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardRequest = z.infer<typeof updateFlashcardSchema>;
export type ListFlashcardsQuery = z.infer<typeof listFlashcardsQuerySchema>;
export type UpdateLearnedRequest = z.infer<typeof updateLearnedSchema>;
