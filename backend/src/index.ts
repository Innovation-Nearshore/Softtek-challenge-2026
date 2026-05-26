import express from 'express';
import { corsMiddleware } from './middlewares/cors';
import { errorHandler } from './middlewares/errorHandler';
import { env } from './config/env';
import healthRoutes from './routes/healthRoutes';
import requestRoutes from './routes/requestRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

// Routes
app.use('/api', healthRoutes);
app.use('/api/requests', requestRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'IA Challenge API',
    version: '1.0.0',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'RESOURCE_NOT_FOUND',
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(env.port, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║   IA Challenge Backend Server              ║
  ║   Version: 1.0.0                          ║
  ╠════════════════════════════════════════════╣
  ║   Environment: ${env.nodeEnv.padEnd(31)}║
  ║   Port: ${env.port.toString().padEnd(38)}║
  ║   Database: ${env.db.database.padEnd(36)}║
  ║   Schema: ${env.db.schema.padEnd(39)}║
  ╚════════════════════════════════════════════╝
  `);

  console.log(`✓ Server running at http://localhost:${env.port}`);
  console.log(`✓ API available at http://localhost:${env.port}/api`);
  console.log(`✓ Health check: http://localhost:${env.port}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
