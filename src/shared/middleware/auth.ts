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

    const token = authHeader.substring(7); // Remove "Bearer "
    
    const decoded = authService.verifyToken(token) as any;
    
    // Adicionar usuário à request
    (req as any).user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    next(new AppError('Token inválido ou expirado', 401));
  }
};