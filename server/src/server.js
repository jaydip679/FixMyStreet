const app = require('./app');
const env = require('./config/env');
const { connectDatabase } = require('./config/db');

async function startServer() {
  await connectDatabase();
  const server = app.listen(env.port, () => {
    console.log(`[Server] FixMyStreet API running on http://localhost:${env.port} in ${env.nodeEnv} mode`);
  });

  const shutdown = async () => {
    console.log('\n[Server] Graceful shutdown initiated...');
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (require.main === module) {
  startServer();
}

module.exports = startServer;
