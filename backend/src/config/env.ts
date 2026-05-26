import * as dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Admin123',
    database: process.env.DB_NAME || 'ai_challenge',
    schema: process.env.DB_SCHEMA || 'reto_c',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
  },
};
