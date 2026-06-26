import app from './app';
import { env } from './config/env.config';
import { connectDB } from './config/db.config';
import { redisCache } from './config/redis.config';
import { logger } from './config/logger.config';

// Handle uncaught exceptions (e.g. referencing an undefined variable)
process.on('uncaughtException', (err: Error) => {
  logger.error('❌ UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

const startServer = async () => {
  // 1. Connect to Database
  await connectDB();

  // 2. Connect to Cache (graceful fallback inside)
  await redisCache.connect();

  // 3. Start listening on PORT
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`🩺 Health check available at http://localhost:${env.PORT}/api/health`);
  });

  // Handle unhandled promise rejections (e.g. failed async database operations)
  process.on('unhandledRejection', (err: Error) => {
    logger.error('❌ UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
