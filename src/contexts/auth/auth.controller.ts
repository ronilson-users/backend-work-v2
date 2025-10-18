import { Request, Response } from 'express';
import * as AuthService from './auth.service';
import { asyncHandler } from '@/shared/utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  res.json(result);
});