// src/contexts/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export const authController = {
 /**
  * Login do usuário
  */
 login: asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.json({
   success: true,
   message: 'Login realizado com sucesso',
   data: result
  });
 }),

 /**
  * Buscar perfil do usuário autenticado
  */
 getProfile: asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const profile = await authService.getProfile(userId);

  res.json({
   success: true,
   data: profile
  });
 }),

 /**
  * Refresh token (opcional)
  */
 refreshToken: asyncHandler(async (req: Request, res: Response) => {

  res.json({ message: 'Refresh token endpoint' });
 })
};