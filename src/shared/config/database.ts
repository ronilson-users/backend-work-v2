import mongoose from 'mongoose';
import { env } from './env';

const mongooseOptions: mongoose.ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: env.NODE_ENV === 'production' ? 20 : 10,
  serverSelectionTimeoutMS: 10000, // Aumentado para 10s
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  retryReads: true,
};

// Cache da conexão para evitar hot reload issues
let isConnected = false;
let connectionAttempt: Promise<void> | null = null;

export const connectDatabase = async (): Promise<void> => {
  // Previne múltiplas conexões simultâneas
  if (connectionAttempt) {
    return connectionAttempt;
  }

  if (isConnected) {
    console.log('📊 MongoDB already connected');
    return;
  }

  connectionAttempt = (async () => {
    try {
      console.log(`🔗 Connecting to MongoDB in ${env.NODE_ENV} mode...`);
      
      await mongoose.connect(env.MONGODB_URI, mongooseOptions);
      
      isConnected = true;
      console.log('✅ Connected to MongoDB');
      console.log(`📊 Connection status: ${getConnectionStatus()}`);

      setupEventListeners();
      
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      isConnected = false;
      connectionAttempt = null;
      process.exit(1);
    }
  })();

  return connectionAttempt;
};

const setupEventListeners = (): void => {
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 MongoDB disconnected');
    isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔁 MongoDB reconnected');
    isConnected = true;
  });

  mongoose.connection.on('connecting', () => {
    console.log('🔄 Connecting to MongoDB...');
  });

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected');
    isConnected = true;
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    // Não desconectar em desenvolvimento com hot reload
    if (env.NODE_ENV === 'production') {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    } else {
      console.log('🔌 Skipping disconnect in development mode');
    }
    isConnected = false;
    connectionAttempt = null;
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

export const checkDatabaseHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  details: string;
  responseTime?: number;
}> => {
  const startTime = Date.now();

  try {
    // Verifica se está conectado
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        details: `Database not connected (status: ${getConnectionStatus()})`
      };
    }

    // Garante que db não está undefined (TypeScript-safe)
    const db = mongoose.connection.db;
    if (!db) {
      return {
        status: 'unhealthy',
        details: 'Database handle is undefined (likely not initialized yet)',
      };
    }

    // Ping com timeout
    const pingPromise = db.admin().ping();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database ping timeout')), 5000)
    );

    await Promise.race([pingPromise, timeoutPromise]);
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      details: 'Database connection is stable',
      responseTime
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: `Database health check failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

// Helper para obter status da conexão
export const getConnectionStatus = (): string => {
  const states = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
};

// Getter para verificar status externamente
export const getIsConnected = (): boolean => isConnected;