import app from './app.js';
import env from './config/env.js';
import pool from './config/database.js';

const server = app.listen(env.port, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${env.port} (${env.nodeEnv})`);
});

// Graceful shutdown – close DB pool and HTTP server cleanly
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('PostgreSQL pool closed.');
    } catch (err) {
      console.error('Error closing PostgreSQL pool:', err);
    }
    process.exit(0);
  });

  // Force exit after 10 s if graceful shutdown stalls
  setTimeout(() => {
    console.error('Forcing exit after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled promise rejections – log and exit (OWASP A09)
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
