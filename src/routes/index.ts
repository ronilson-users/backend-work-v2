/**
Copyright (c) [2025] [RSj-roni]
Filename: index.ts 
 * PATH: src/routes/index.ts
*/


import { Router } from 'express';
import {
 authRoutes,
 userRoutes,
 jobRoutes,
 contractRoutes,
 paymentRoutes,
 healthRoutes,
 workRoutes
} from '../contexts';

const router = Router();

// 🔐 Public Routes
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

// 🔒 Protected Routes
router.use('/users', userRoutes);

router.use('/jobs', jobRoutes);
router.use('/contracts', contractRoutes);

router.use('/work', workRoutes);

router.use('/payments', paymentRoutes);// em analise
// proximas maps / notifications outras....


export default router;


