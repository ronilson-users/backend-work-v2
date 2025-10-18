/**
Copyright (c) [2025] [RSj-roni]
Filename: index.ts 
 * PATH: src/routes/index.ts
*/


import { Router } from 'express';
import {
 authRoutes,
 userRoutes,
 profileRoutes,
 companyRoutes,
 jobRoutes,
 contractRoutes,
 paymentRoutes,
 healthRoutes
} from '../contexts';

const router = Router();

// 🔐 Public Routes
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

// 🔒 Protected Routes
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/contracts', contractRoutes);
router.use('/payments', paymentRoutes);


export default router;


