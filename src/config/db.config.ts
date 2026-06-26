import mongoose from 'mongoose';
import { env } from './env.config';
import { logger } from './logger.config';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true, // Build indexes on startup (suitable for dev; in huge production, handle out-of-band)
    });

    logger.info(`🔌 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('🔌 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('🔌 MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('🔌 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    logger.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});
