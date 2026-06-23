import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da categoria é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (ex: #FFFFFF)'),
  icon: z
    .enum([
      'book-outline',
      'globe-outline',
      'calculator-outline',
      'language-outline',
      'flask-outline',
      'code-slash-outline',
    ], {
      errorMap: () => ({ message: 'Ícone inválido' }),
    })
    .default('book-outline'),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da categoria é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (ex: #FFFFFF)')
    .optional(),
  icon: z
    .enum([
      'book-outline',
      'globe-outline',
      'calculator-outline',
      'language-outline',
      'flask-outline',
      'code-slash-outline',
    ])
    .optional(),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
