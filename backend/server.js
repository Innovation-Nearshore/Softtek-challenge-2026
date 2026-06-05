'use strict';

require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./config/initDb');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
      console.log(`    API health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
