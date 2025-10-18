import { Router } from 'express';

//======= Controller Auth  ===================
import * as AuthController from './auth.controller';

 
//======= Schemas Auth  ===================
import {
 registerSchema,
 loginSchema
} from './auth.schema';


const router = Router();

// ----------------------------------------
// 🔐 PROTECTED ROUTES (require authentication)
// ----------------------------------------

/* router.post('/register', validateSchema(registerSchema), AuthController.register);

router.post('/login', validateSchema(loginSchema), AuthController.login);

 */
// 🎯 Rotas de auth.
router.get('/', (req, res) => {
 res.json({ message: 'authRoutes routes - TODO' });
});

export const authRoutes = router;

/**
 * 🎯 RESTful Pattern Reference:
 * POST   /register            → createJob
 * POST   /login               → createJob
 
 */




















