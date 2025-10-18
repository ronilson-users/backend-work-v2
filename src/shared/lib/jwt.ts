// src/shared/lib/jwt.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}


const JWT_CONFIG: jwt.SignOptions = {
  expiresIn: '7d',
  issuer: 'work-history-api', 
  audience: 'work-history-users'
};


export const generateToken = (userId: string): string => {
  if (!userId) {
    throw new Error('User ID is required to generate token');
  }

  return jwt.sign(
    { userId }, 
    env.JWT_SECRET, 
    JWT_CONFIG
  );
};

export const verifyToken = (token: string): JwtPayload => {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience as string
    });
    
    if (typeof decoded === 'string' || !(decoded as any).userId) {
      throw new Error('Invalid token payload');
    }
    
    return decoded as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

// Utility function para extrair token do header
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer "
};