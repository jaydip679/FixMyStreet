const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Fix for Windows / campus / local ISP DNS blocking querySrv lookups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if not permitted
}

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
    console.error('\n=============================================================');
    console.error('[MongoDB] Connection Failed:', error.message);
    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.error('\n>>> LOCAL MONGODB SERVICE IS NOT RUNNING ON YOUR SYSTEM <<<');
      console.error('To fix this, create a free MongoDB Atlas cluster and add its connection string:');
      console.error('1. Create "server/.env" file (copied from server/.env.example)');
      console.error('2. Set MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.../fixmystreet');
      console.error('=============================================================\n');
    }
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
