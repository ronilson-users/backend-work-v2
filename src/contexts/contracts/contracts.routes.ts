// src/contexts/contracts/contracts.routes.ts
import { Router } from 'express';
import { contractsController } from './contracts.controller';
import { authenticate } from '../../shared/middleware/auth';
import { validateBody, validateParams } from '@/shared/middleware/validate';
// import { contractSchemas } from './contracts.schema'; // Vamos criar depois

const router = Router();

// 🔐 TODAS as rotas precisam de autenticação
router.use(authenticate);

// 📝 Rotas de Contratos
router.post('/', contractsController.createContract);

router.get('/my', contractsController.getMyContracts);

router.get('/:contractId', contractsController.getContract);

router.patch('/:contractId/status', contractsController.updateStatus);

// ✍️ Rotas de Assinatura
router.post('/:contractId/sign', contractsController.signContract);

// 🔄 Rotas Automáticas (a partir de jobs)
router.post('/from-job/:jobId', contractsController.createFromJob);

export const contractRoutes = router;

/**
 * 🎯 RESTful Pattern Reference:
 * POST   /              → 
 * GET    /my              → 
 * GET   /contractId           → 
 * PATCH   /contractId/status    → 
 * POST  /contractId/sign       → 
 * POST   /from-job/:jobId      → 
 */