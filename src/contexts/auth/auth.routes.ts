// src/contexts/auth/auth.routes.ts
import { Router } from 'express';
import { authController } from './auth.controller';
import { validateBody } from '@/shared/middleware/validate';
import { UserLoginSchema } from '../users/users.schema';
import { authenticate } from '@/shared/middleware/auth';

const router = Router();


//===================
// 🔓 Rotas públicas
//===================

router.post('/login', validateBody(UserLoginSchema), authController.login);

//====================
// 🔐 Rotas protegidas
//====================

router.use(authenticate); // Middleware de autenticação para rotas abaixo

//==============================================
// 🔐 PROTECTED ROUTES (require authentication)
//==============================================

router.get('/profile', authController.getProfile);
router.post('/refresh', authController.refreshToken);

export const authRoutes = router;

/**
 * 🎯 RESTful Pattern Reference:
 * POST   /login         → 
 * GET    /profile       → 
 * POST   /refresh       → 
 
 */