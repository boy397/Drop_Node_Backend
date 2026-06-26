import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_notifications';
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log(`🔌 Notification Service Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Notification Service MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('🔌 Notification Service MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔌 Notification Service MongoDB reconnected');
});
