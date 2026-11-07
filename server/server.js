const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const { validateEnv } = require('./src/config/env');
validateEnv();

const app = require('./src/app');
const { connectDB, closeDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[DO-TODAY Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful shutdown on SIGINT (Ctrl+C) and SIGTERM
    const handleShutdown = (signal) => {
      console.log(`\n[DO-TODAY Server] ${signal} signal received: closing server & saving database...`);
      server.close(async () => {
        try {
          await closeDB();
          console.log('[DO-TODAY Server] Database flushed and cleanly stopped.');
        } catch (closeErr) {
          console.error('[DO-TODAY Server] Error during shutdown:', closeErr.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

    process.on('uncaughtException', (err) => {
      console.error('[CRITICAL] Uncaught Exception:', err.message || err);
      handleShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      console.error('[CRITICAL] Unhandled Promise Rejection:', reason);
      handleShutdown('unhandledRejection');
    });
  } catch (err) {
    console.error(`[Server Start Error]: ${err.message}`);
    process.exit(1);
  }
};

startServer();
