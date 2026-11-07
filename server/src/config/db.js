const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { seedDevData } = require('../utils/seed');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/do-today';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    });
    console.log(`[Database] MongoDB connected to primary server: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Primary MongoDB connection failed at ${uri} (${err.message}).`);

    // In development or test, start persistent local MongoDB service if primary fails
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting persistent local MongoDB engine on port 27017...');
        const { MongoMemoryServer } = require('mongodb-memory-server');

        const dbDir = path.resolve(__dirname, '../../../.mongo_data');
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }

        // Attempt to bind to standard port 27017 with persistent WiredTiger disk storage
        try {
          mongod = await MongoMemoryServer.create({
            instance: {
              port: 27017,
              portGeneration: false,
              dbPath: dbDir,
              storageEngine: 'wiredTiger',
              dbName: 'do-today',
            },
          });
        } catch (portErr) {
          console.warn(`[Database] Port 27017 busy (${portErr.message}). Starting with dynamic port on persistent disk...`);
          mongod = await MongoMemoryServer.create({
            instance: {
              dbPath: dbDir,
              storageEngine: 'wiredTiger',
              dbName: 'do-today',
            },
          });
        }

        const baseUri = mongod.getUri();
        const connectionUri = baseUri.endsWith('/') ? `${baseUri}do-today` : `${baseUri}/do-today`;
        const conn = await mongoose.connect(connectionUri);

        console.log(`[Database] Local persistent MongoDB connected: ${connectionUri}`);
        console.log(`[Database] -> Data directory: ${dbDir}`);
        console.log(`[Database] -> MongoDB Compass URL: ${connectionUri}`);
      } catch (memErr) {
        console.error('[Database] Failed to initialize local MongoDB:', memErr.message);
        throw err;
      }
    } else {
      throw err;
    }
  }

  // Seed default demo user and sample tasks in development if database is empty
  if (process.env.NODE_ENV === 'development') {
    await seedDevData();
  }
};

const closeDB = async () => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.db.admin().command({ fsync: 1 });
        await mongoose.connection.db.admin().command({ shutdown: 1, force: true, timeoutSecs: 2 });
      } catch (_) {
        // Ignore connection close during shutdown command
      }
      await mongoose.disconnect();
    }
  } catch (_) {}

  if (mongod) {
    try {
      await mongod.stop({ doCleanup: false });
    } catch (_) {}
    mongod = null;
  }
};

module.exports = { connectDB, closeDB };
