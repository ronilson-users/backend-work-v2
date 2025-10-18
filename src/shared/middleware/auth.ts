import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/shared/lib/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing or invalid token' });

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload)
    return res.status(401).json({ error: 'Invalid or expired token' });

  req.user = payload;
  next();
};