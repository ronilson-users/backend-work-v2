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
 * Centralized Role enum so every consumer uses the same set of roles.
 */
 
export const RoleEnum = z.enum(['user', 'company', 'admin']);
export type Role = z.infer<typeof RoleEnum>;

/**
 * Example create user schema — set default role to 'user'.
 * Adjust the rest of the schema fields to match your existing file.
 */
 
export const createUserSchema = z.object({
  // ... other fields (name, email, etc.)
  role: RoleEnum.default('user'), // Usuário comum, empresa ou admin
});

/**
 * Example update user schema — role is optional on updates,
 * but still restricted to the enum values.
 */export const updateUserSchema = z.object({
  // ... other updatable fields
  role: RoleEnum.optional(),
});

export type UserRegisterData = z.infer<typeof UserRegisterSchema>;
export type UserLoginData = z.infer<typeof UserLoginSchema>;
export type UserUpdateData = z.infer<typeof UserUpdateSchema>;





