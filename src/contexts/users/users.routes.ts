// src/contexts/users/users.routes.ts - VERSÃO COMPLETA
import { Router } from 'express';
import { userController } from './users.controller';
import { validateBody } from '../../shared/middleware/validate';
import { authenticate } from '../../shared/middleware/auth';
import { 
  UserRegisterSchema, 
  UserAvailabilitySchema,
  UserSkillsSchema,
  UserUpdateProfileSchema 
} from './users.schema';

const router = Router();

// 🔓 Rota pública
router.post('/register', validateBody(UserRegisterSchema), userController.register);

// 🔐 Rotas protegidas
router.use(authenticate);

router.get('/', userController.getAll);

router.get('/profile', userController.getProfile);
router.get('/email/:email', userController.findByEmail);
router.put('/profile', validateBody(UserUpdateProfileSchema), userController.updateProfile);

router.post('/availability', validateBody(UserAvailabilitySchema), userController.updateAvailability);

router.post('/skills', validateBody(UserSkillsSchema), userController.addSkills);

export const userRoutes = router;

/**
 * 🎯 RESTful Pattern Reference:
 * POST   /register  → 
 * GET    /   → 
 * GET    /profile        →  
 * GET    /email/:email     → 
 * POST   /availability  → 
 * POST   /skills  → 
 
 */