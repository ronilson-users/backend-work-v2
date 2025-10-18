// src/routes/health.routes.ts
import { Router } from 'express';
import { env } from '../../shared/config/env';

// ----------------------------------------
// Router Setup
// ----------------------------------------

const router = Router();

// ----------------------------------------
// Health Check Route
// ----------------------------------------

router.get('/', (req, res) => {
  const responseData = {
    status: 'OK',
    message: 'Work History API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0'
  };

  res.status(200).json(responseData);
});



export const healthRoutes = router;