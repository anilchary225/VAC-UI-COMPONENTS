import mongoose from 'mongoose';
import { env } from './env';

export type DatabaseStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

let currentStatus: DatabaseStatus = 'disconnected';
let lastError: string | null = null;
let connectionPromise: Promise<boolean> | null = null;

export const connectDatabase = async (): Promise<boolean> => {
  // 1. If already connected in this process (warm serverless container), reuse connection immediately
  if (mongoose.connection.readyState === 1) {
    currentStatus = 'connected';
    return true;
  }

  // 2. If a connection attempt is currently in flight, return the active promise
  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  currentStatus = 'connecting';
  connectionPromise = (async () => {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: env.NODE_ENV === 'test' ? 600 : 4000,
        connectTimeoutMS: env.NODE_ENV === 'test' ? 600 : 4000,
        maxPoolSize: 10,
        minPoolSize: 1,
        socketTimeoutMS: 45000,
      });
      currentStatus = 'connected';
      lastError = null;
      if (env.NODE_ENV !== 'test') {
        console.log('✅ Connected to MongoDB at:', env.MONGODB_URI.replace(/\/\/.*@/, '//***@'));
      }
      return true;
    } catch (error: any) {
      currentStatus = 'error';
      lastError = error?.message || 'Failed to connect to MongoDB';
      console.warn('⚠️ MongoDB connection could not be established:');
      console.warn(`   Reason: ${lastError}`);
      console.warn('   The server will run in degraded mode (health & catalog static fallbacks available).');
      return false;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

mongoose.connection.on('connected', () => {
  currentStatus = 'connected';
  lastError = null;
});

mongoose.connection.on('disconnected', () => {
  currentStatus = 'disconnected';
});

mongoose.connection.on('error', (err) => {
  currentStatus = 'error';
  lastError = err?.message || 'Database connection error';
});

export const getDatabaseStatus = (): { status: DatabaseStatus; error: string | null } => ({
  status: currentStatus,
  error: lastError,
});
