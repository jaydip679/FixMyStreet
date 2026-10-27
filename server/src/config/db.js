const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

async function connectDatabase(uri = env.mongodbUri) {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri);
    isConnected = true;
    if (env.nodeEnv !== 'test') {
      console.log(`[MongoDB] Connected to database: ${conn.connection.name}`);
    }
    return conn.connection;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    if (env.nodeEnv !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase
};
