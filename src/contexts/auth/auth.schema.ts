import { z } from 'zod';

export const registerSchema = z.object({
 name: z.string().min(7, 'Name must be at least 3 characters long'),
 
 email: z.string().email('Invalid email format').trim().toLowerCase(),
 
 password: z.string().min(6, 'Password must be at least 6 characters long'),
 
 role: z.enum(['worker', 'company', 'admin']).default('worker')
 
});

export const loginSchema = z.object({
 email: z.string().email('Invalid email').trim().toLowerCase(),
 
 password: z.string().min(6, 'Password must be at least 6 characters long')
 
});