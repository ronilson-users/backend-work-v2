import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from '../config/env';
import { Request, Response } from 'express';  // ← Import adicionado para tipagem correta

/**
 * 🧭 Configuração principal do logger Pino
 * Define formato de saída e nível de log conforme o ambiente.
 */
export const logger = pino({
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
});

/**
 * 🚦 Middleware para logar requisições HTTP (usado no Express)
 * Corrigido: Tipagem dos callbacks para compatibilidade com Express.Request
 */
export const httpLogger = pinoHttp({
  logger,
  customSuccessMessage: function (req: Request, res: Response) {
    // ← Ordem corrigida: req primeiro, depois res
    // ← Tipado como Request do Express para acessar method/url
    return `✅ ${req.method} ${req.url} → ${res.statusCode}`;
  },
  customErrorMessage: function (req: Request, res: Response, err: Error) {
    // ← Ordem corrigida: req, res, err
    return `❌ ${req.method} ${req.url} → ${res.statusCode} | ${err.message}`;
  },
  autoLogging: true,
});