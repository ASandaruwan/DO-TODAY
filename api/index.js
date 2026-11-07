/**
 * Vercel Serverless Function Entrypoint
 * Bridges Express app with Vercel serverless Lambda execution.
 */

const app = require('../server/src/app');
const { connectDB } = require('../server/src/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  // Reuse existing database connection in warmed lambda container
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless] Failed to connect to MongoDB:', err.message);
      return res.status(500).json({
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message,
      });
    }
  }

  return app(req, res);
};
