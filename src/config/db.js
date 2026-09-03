const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `[DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error(`[DB] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[DB] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
