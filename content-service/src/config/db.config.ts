import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_content';
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log(`🔌 Content Service Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Content Service MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('🔌 Content Service MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔌 Content Service MongoDB reconnected');
});
