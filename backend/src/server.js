'use strict';

require('dotenv').config();

// Initialize DB connection (tests connection on require)
require('./config/database');

const app = require('./app');
const config = require('./config');

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`    Environment: ${config.server.nodeEnv}`);
});
