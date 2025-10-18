import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import { env } from '@/shared/config/env';
import { connectDatabase } from './shared/config/database';
import routes  from './routes/';
import { errorHandler } from '@/shared/middleware/errorHandler';
import { logger, httpLogger } from '@/shared/utils/logger';

const app = express();

// 🧩 Middleware de log estruturado
app.use(httpLogger);

// 🔒 Rate Limiting
const limiter = rateLimit({
 windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
 max: Number(env.RATE_LIMIT_MAX_REQUESTS) || 100,
 message: { error: 'Too many requests, try again later.' },
 standardHeaders: true,
 legacyHeaders: false,
});

// 🧱 Middlewares base
app.use(helmet());
app.use('/api', limiter);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🌡️ Health Check
app.get('/api/health', (_, res) =>
 res.status(200).json({
  status: 'OK',
  timestamp: new Date().toISOString(),
  environment: env.NODE_ENV,
  port: env.PORT,
 })
);

// 🌐 Rotas principais
app.use('/api', routes);

// 🧨 Error Handler
app.use(errorHandler);

// 🚀 Inicialização do servidor
const startServer = async (): Promise<void> => {
 try {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
   logger.info(`🚀 Server running on port ${env.PORT}`);
  });

  const gracefulShutdown = async () => {
   logger.info('🧩 Graceful shutdown initiated...');
   await mongoose.connection.close();
   server.close(() => {
    logger.info('✅ Server closed cleanly');
    process.exit(0);
   });
   setTimeout(() => {
    logger.error('❌ Force shutdown after timeout');
    process.exit(1);
   }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
 } catch (error) {
  logger.error({ err: error }, '❌ Failed to start server'); // ✅ forma correta
  process.exit(1);
 }
};

// Evita inicializar durante testes
if (process.env.NODE_ENV !== 'test') {
 startServer();
}

// 👇 Exporta o app para testes de integração
export default app;