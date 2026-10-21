import mongoose from 'mongoose';
import { env } from './env';

export type DatabaseStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

let currentStatus: DatabaseStatus = 'disconnected';
let lastError: string | null = null;

export const connectDatabase = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    currentStatus = 'connected';
    return true;
  }

  currentStatus = 'connecting';
  try {
    // 5 seconds connection timeout so failure doesn't hang the server boot
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    currentStatus = 'connected';
    lastError = null;
    console.log('✅ Connected to MongoDB at:', env.MONGODB_URI.replace(/\/\/.*@/, '//***@'));
    return true;
  } catch (error: any) {
    currentStatus = 'error';
    lastError = error?.message || 'Failed to connect to MongoDB';
    console.warn('⚠️ MongoDB connection could not be established:');
    console.warn(`   Reason: ${lastError}`);
    console.warn('   The server will run in degraded mode (health & catalog static fallbacks available).');
    return false;
  }
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
