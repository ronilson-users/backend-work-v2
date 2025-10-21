// src/contexts/jobs/jobs.routes.ts
import { Router } from 'express';
import {
 authenticate
} from '@/shared/middleware/auth';
import {
 validateBody
} from '@/shared/middleware/validate';
import {
 createJobSchema,
 cancelJobSchema,
 selectWorkerSchema,
 
} from './jobs.schema';

import {
 createJob as handleCreateJob,
 getJobs as handleGetJobs,
 getJobById as handleGetJobById,
 updateJob as handleUpdateJob,
 applyToJob as handleApplyToJob,
 getMyCompanyJobs as handleGetMyCompanyJobs,
 selectWorker as handleSelectWorker,
 cancelJob as handleCancelJob
} from './jobs.controller';

const router = Router();

// 🔐 PROTECTED ROUTES
router
 .post('/',
  authenticate,
  validateBody(createJobSchema),
  handleCreateJob);

router
 .put('/:id',
  authenticate,
  handleUpdateJob);

router
 .post('/:id/apply',
  authenticate,
  handleApplyToJob);

router
 .get('/company/my',
  authenticate,
  handleGetMyCompanyJobs);

router
 .patch('/:id/select-worker',
  authenticate,
  validateBody(selectWorkerSchema),
  handleSelectWorker);

router
 .patch('/:id/cancel',
  authenticate, validateBody(cancelJobSchema), handleCancelJob);

// 🌐 PUBLIC ROUTES
router
 .get('/', handleGetJobs);

router
 .get('/:id', handleGetJobById);


export const jobRoutes = router;

/**
 * 🎯 RESTful Pattern Reference:
 * POST   /jobs            → createJob
 * GET    /jobs            → getJobs
 * GET    /jobs/:id        → getJobById
 * PUT    /jobs/:id        → updateJob
 * POST   /jobs/:id/apply   → applyToJob
 * GET    /jobs/company/my  → getMyCompanyJobs
 * PATCH  /jobs/:id/select-worker  → selectWorker
 * PATCH  /jobs/:id/cancel  → cancelJob
 */