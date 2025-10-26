// src/shared/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../../contexts/auth/auth.service';
import { AppError } from '../utils/error';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de acesso não fornecido', 401);
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);

    if (!decoded) { 
      throw new AppError('Token inválido ou expirado', 401);
    }

    (req as any).user = {
      id: (decoded as any).id,
      email: (decoded as any).email,
      role: (decoded as any).role
    };

    next();
  } catch (error) {
    next(error);
  }
};