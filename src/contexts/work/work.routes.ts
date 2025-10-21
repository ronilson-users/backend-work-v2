// src/contexts/work/work.routes.ts
import { Router } from 'express';
import { workController } from './work.controller';
import { authenticate } from '../../shared/middleware/auth';
import { validateBody, validateParams } from '../../shared/middleware/validate';
// import { workSchemas } from './work.schema'; // Vamos criar depois

const router = Router();

// 🔐 TODAS as rotas precisam de autenticação
router.use(authenticate);

// 🟢 CHECK-IN/CHECK-OUT
router.post('/contracts/:contractId/check-in', workController.checkIn);
router.post('/sessions/:sessionId/check-out', workController.checkOut);

// 📸 FOTOS
router.post('/upload-photo', workController.uploadPhoto);

// 👀 CONSULTA
router.get('/sessions', workController.getMySessions);
router.get('/sessions/:sessionId', workController.getSession);
router.get('/contracts/:contractId/sessions', workController.getContractSessions);

// 📊 DASHBOARD
router.get('/stats', workController.getWorkStats);

// ✅ CONFIRMAÇÃO (EMPRESA)
router.post('/sessions/:sessionId/confirm', workController.confirmSession);

export const workRoutes = router;