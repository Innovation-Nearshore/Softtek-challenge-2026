const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const requestsRoutes = require('./routes/requestsRoutes');
const areasRoutes = require('./routes/areasRoutes');
const tiposSolicitudRoutes = require('./routes/tiposSolicitudRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Swagger UI — available at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Business routes
app.use('/requests', requestsRoutes);
app.use('/areas', areasRoutes);
app.use('/tipos-solicitud', tiposSolicitudRoutes);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
