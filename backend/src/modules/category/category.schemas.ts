import { z } from 'zod';

const categoryIconSchema = z.enum(
  [
    'book-outline',
    'globe-outline',
    'calculator-outline',
    'language-outline',
    'flask-outline',
    'code-slash-outline',
  ],
  { message: 'Icone invalido' },
);

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da categoria e obrigatorio')
    .max(100, 'Nome deve ter no maximo 100 caracteres'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (ex: #FFFFFF)'),
  icon: categoryIconSchema.default('book-outline'),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da categoria e obrigatorio')
    .max(100, 'Nome deve ter no maximo 100 caracteres')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (ex: #FFFFFF)')
    .optional(),
  icon: categoryIconSchema.optional(),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;

