'use strict';

require('dotenv').config();

const config = {
  server: {
    port: parseInt(process.env.PORT, 10) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'ai_challenge',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    schema: process.env.DB_SCHEMA || 'reto_c',
  },
};

module.exports = config;
