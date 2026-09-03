require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const Program = require('./src/models/Program');
const { seedDatabase } = require('./scripts/seed');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB();

    // Automatically populate programs, campuses, and catalog data if database is fresh
    try {
      const programCount = await Program.countDocuments();
      if (programCount === 0) {
        console.log('[AutoSeed] Fresh database detected. Automatically populating academic programs, campuses, and catalog...');
        await seedDatabase(false);
        console.log('[AutoSeed] Database initialized with all programs and campuses.');
      }
    } catch (seedErr) {
      console.warn('[AutoSeed] Notice: Auto-seed check finished:', seedErr.message);
    }

    const server = app.listen(PORT, HOST, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 NOVA Institute of Technology Server is Live!`);
      console.log(`📡 Listening on: http://${HOST}:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`======================================================\n`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[Server] Critical startup failure:', err);
    process.exit(1);
  }
};

startServer();
