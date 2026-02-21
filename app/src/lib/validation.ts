import { z } from 'zod';

/** Formato obrigatório: algo@dominio.extensao (ex: usuario@gmail.com) */
const EMAIL_STRICT = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const emailSchema = z
  .string()
  .min(1, { error: 'Email é obrigatório' })
  .refine((v) => EMAIL_STRICT.test(v.trim()), { error: 'Email inválido (ex: usuario@gmail.com)' });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: 'Senha é obrigatória' }),
});

export const registerSchema = z.object({
  name: z.string().min(3, { error: 'Nome deve ter pelo menos 3 caracteres' }),
  email: emailSchema,
  password: z.string().min(6, { error: 'Senha deve ter pelo menos 6 caracteres' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
