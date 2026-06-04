import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import initiativesRouter from './routes/initiatives.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// OWASP A05 – Security Misconfiguration: set secure HTTP headers
app.use(helmet());

// Disable X-Powered-By to avoid fingerprinting
app.disable('x-powered-by');

// CORS – only allow configured origin
app.use(
  cors({
    origin: env.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    optionsSuccessStatus: 200,
  })
);

// OWASP A04 – Insecure Design: global rate limiting
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Body parsing – limit payload size (OWASP A04)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Health check – no auth required
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/initiatives', initiativesRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Centralised error handler
app.use(errorHandler);

export default app;
