import { z } from 'zod';

/**
 * Schema de criação de usuário (registro)
 */
export const UserRegisterSchema = z.object({
  name: z.string().min(3, 'Name must have at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must have at least 6 characters'),
  role: z.enum(['user', 'company']).default('user'), // Usuário comum ou empresa
});

/**
 * Schema de login de usuário
 */
export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must have at least 6 characters'),
});

/**
 * Schema de atualização de usuário (admin)
 */
export const UserUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'company', 'admin']).optional(),
  isActive: z.boolean().optional(),
});

export type UserRegisterData = z.infer<typeof UserRegisterSchema>;
export type UserLoginData = z.infer<typeof UserLoginSchema>;
export type UserUpdateData = z.infer<typeof UserUpdateSchema>;