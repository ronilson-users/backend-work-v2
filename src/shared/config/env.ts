/**
Copyright (c) [2025] [RSj-roni]
Filename: env.ts
PATH : src/shared/config/env.ts
*/

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
 MONGODB_URI: z.string().min(1, "MONGODB_URI é obrigatória para conexão com o banco"),
 JWT_SECRET: z.string().min(1, "JWT_SECRET é obrigatória para segurança dos tokens"),
 NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
 PORT: z.string().default('3000').transform(Number),
 CORS_ORIGIN: z.string().default('http://localhost:3000'),
 LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
 RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number), // 15min
 RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
});

export const env = envSchema.parse(process.env);

// DEBUG: Verifique se as variáveis estão carregando
console.log('🔧 Environment Variables Loaded:');
console.log('   MONGODB_URI:', !!env.MONGODB_URI);
console.log('   JWT_SECRET:', !!env.JWT_SECRET);
console.log('   NODE_ENV:', env.NODE_ENV);
console.log('   PORT:', env.PORT);

