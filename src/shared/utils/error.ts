/**
 * Copyright (c) [2025] [RSj-roni]
 * Filename: error.ts
 *
 * Centralized custom error definitions for RESTful APIs
 */

export class AppError extends Error {
 public readonly statusCode: number;
 public readonly code: string;
 public readonly isOperational: boolean;

 constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
  super(message);
  this.statusCode = statusCode;
  this.code = code;
  this.isOperational = isOperational;

  // Corrige a pilha de erro para a subclasse
  Error.captureStackTrace(this, this.constructor);
 }
}

/**
 * 400 – Requisição inválida
 */
export class BadRequestError extends AppError {
 constructor(message = 'Bad request', code = 'BAD_REQUEST') {
  super(message, 400, code);
 }
}

/**
 * 401 – Não autenticado
 */

export class UnauthorizedError extends AppError {
 constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
  super(message, 401, code);
 }
}

/**
 * 403 – Sem permissão
 */

export class ForbiddenError extends AppError {
 constructor(message = 'Forbidden', code = 'FORBIDDEN') {
  super(message, 403, code);
 }
}

/**
 * 404 – Recurso não encontrado
 */

export class NotFoundError extends AppError {
 constructor(message = 'Resource not found', code = 'NOT_FOUND') {
  super(message, 404, code);
 }
}

/**
 * 409 – Conflito de estado (ex: duplicado)
 */

export class ConflictError extends AppError {
 constructor(message = 'Conflict', code = 'CONFLICT') {
  super(message, 409, code);
 }
}

/**
 * 422 – Erro de validação semântico
 */

export class ValidationError extends AppError {
 public readonly details?: any;

 constructor(message = 'Validation failed', details?: any) {
  super(message, 422, 'VALIDATION_ERROR');
  this.details = details;
 }
}

/**
 * 500 – Erro interno
 */

export class InternalServerError extends AppError {
 constructor(message = 'Internal server error', code = 'INTERNAL_SERVER_ERROR') {
  super(message, 500, code, false);
 }
}