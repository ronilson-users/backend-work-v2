import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/shared/utils/error';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string | number;
  details?: any;
  errors?: any;
  keyValue?: any;
}

export const errorHandler = (
  error: CustomError | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('🔥 Error captured:', error);

  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details = null;

  // 1️⃣ Detecta nossos erros personalizados (AppError e subclasses)
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = (error as any).details || null;
  }

  // 2️⃣ Mongoose ValidationError
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Failed';
    code = 'VALIDATION_ERROR';
    details = Object.values(error.errors || {}).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));
  }

  // 3️⃣ Duplicate key error (11000)
  else if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
    code = 'DUPLICATE_KEY';
    const field = Object.keys(error.keyValue || {})[0];
    details = [{ field, message: `${field} already exists` }];
  }

  // 4️⃣ CastError (invalid ObjectId)
  else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }

  // 5️⃣ JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // 6️⃣ Zod validation errors
  else if (error.errors && Array.isArray(error.errors)) {
    statusCode = 400;
    message = 'Validation Failed';
    code = 'VALIDATION_ERROR';
    details = error.errors;
  }

  // 7️⃣ Retorno final
  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};