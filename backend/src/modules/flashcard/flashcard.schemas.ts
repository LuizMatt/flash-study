import { z } from 'zod';

export const createFlashcardSchema = z.object({
  categoryId: z
    .string()
    .uuid('ID de categoria invalido'),
  front: z
    .string()
    .min(1, 'Frente do cartao nao pode estar em branco'),
  back: z
    .string()
    .min(1, 'Verso do cartao nao pode estar em branco'),
});

export const updateFlashcardSchema = z.object({
  front: z
    .string()
    .min(1, 'Frente do cartao nao pode estar em branco')
    .optional(),
  back: z
    .string()
    .min(1, 'Verso do cartao nao pode estar em branco')
    .optional(),
});

export const listFlashcardsQuerySchema = z.object({
  categoryId: z
    .string()
    .uuid('ID de categoria invalido')
    .optional(),
  learned: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export const updateLearnedSchema = z.object({
  learned: z.boolean('Status de aprendizado deve ser um valor booleano'),
});

export type CreateFlashcardRequest = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardRequest = z.infer<typeof updateFlashcardSchema>;
export type ListFlashcardsQuery = z.infer<typeof listFlashcardsQuerySchema>;
export type UpdateLearnedRequest = z.infer<typeof updateLearnedSchema>;
