const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nova_institute';

    if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
      console.warn('[DB] Warning: MONGODB_URI is not set. Attempting connection with default URI.');
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`[DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
