import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_auth';
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log(`🔌 Auth Service Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Auth Service MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('🔌 Auth Service MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔌 Auth Service MongoDB reconnected');
});
