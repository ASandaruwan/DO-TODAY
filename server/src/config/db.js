const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/do-today';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB at ${uri}: ${err.message}`);
    
    // In development or test, fall back to mongodb-memory-server if primary fails
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting in-memory MongoDB fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] In-memory MongoDB connected: ${conn.connection.host} (${memUri})`);
      } catch (memErr) {
        console.error('[Database] Failed to initialize in-memory MongoDB fallback:', memErr.message);
        throw err;
      }
    } else {
      throw err;
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, closeDB };

