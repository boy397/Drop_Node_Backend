import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_catalog';
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log(`🔌 Catalog Service Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Catalog Service MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('🔌 Catalog Service MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔌 Catalog Service MongoDB reconnected');
});
