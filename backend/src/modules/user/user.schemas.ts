import { z } from 'zod';

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nome não pode estar vazio')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .optional(),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
      .regex(/[!@#$%^&*]/, 'Senha deve conter pelo menos um caractere especial')
      .optional(),
    currentPassword: z
      .string()
      .min(1, 'Senha atual é obrigatória')
      .optional(),
  })
  .refine(
    (data) => {
      // Se informou nova senha, precisa da senha atual
      if (data.password && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Senha atual é obrigatória para alteração de senha',
      path: ['currentPassword'],
    }
  );

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
