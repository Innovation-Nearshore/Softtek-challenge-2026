const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const solicitudRoutes = require('./routes/solicitudRoutes');

const app = express();

// Inicializar cache con TTL de 60 segundos
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// ==================== SEGURIDAD ====================

// Helmet: Configurar headers de seguridad
app.use(helmet());

// Rate Limiting: Máximo 100 requests por 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS: Permitir solo localhost:3000
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ==================== PARSERS ====================

// Body parser con límite de tamaño
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==================== CACHE MIDDLEWARE ====================

/**
 * Middleware para agregar cache a GET /api/solicitudes
 */
const cacheMiddleware = (req, res, next) => {
  const cacheKey = `solicitudes_${JSON.stringify(req.query)}`;
  
  if (req.method === 'GET') {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('✓ Cache HIT:', cacheKey);
      return res.json(cachedData);
    }
  }
  
  // Interceptar el método json original para cachear la respuesta
  const originalJson = res.json;
  res.json = function(data) {
    if (req.method === 'GET' && res.statusCode === 200) {
      cache.set(cacheKey, data);
      console.log('✓ Cache SET:', cacheKey);
    }
    return originalJson.call(this, data);
  };
  
  next();
};

// Función para invalidar cache
app.locals.invalidateCache = (pattern = null) => {
  if (!pattern) {
    cache.flushAll();
    console.log('✓ Cache FLUSHED (todos)');
  } else {
    const keys = cache.keys();
    keys.forEach(key => {
      if (key.includes(pattern)) {
        cache.del(key);
        console.log(`✓ Cache DELETED: ${key}`);
      }
    });
  }
};

// ==================== RUTAS ====================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de solicitudes con cache en GET /
app.use('/api/solicitudes', (req, res, next) => {
  if (req.method === 'GET' && req.path === '/') {
    cacheMiddleware(req, res, next);
  } else {
    next();
  }
});

app.use('/api/solicitudes', solicitudRoutes);

// ==================== INVALIDAR CACHE EN CAMBIOS ====================

/**
 * Middleware para invalidar cache cuando se crea o actualiza
 */
app.use('/api/solicitudes', (req, res, next) => {
  // Interceptar respuestas de POST y PATCH para invalidar cache
  const originalJson = res.json;
  res.json = function(data) {
    if ((req.method === 'POST' || req.method === 'PATCH') && data.success) {
      app.locals.invalidateCache('solicitudes_');
    }
    return originalJson.call(this, data);
  };
  next();
});

// ==================== 404 HANDLER ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// ==================== GLOBAL ERROR HANDLER ====================

/**
 * Middleware para manejar errores globales
 * Debe ser el último middleware
 */
app.use((err, req, res, next) => {
  console.error('🔴 ERROR GLOBAL:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      details: err.details,
    });
  }

  // Error de BD
  if (err.code && err.code.startsWith('42')) {
    return res.status(400).json({
      success: false,
      error: 'Error en base de datos',
      message: err.message,
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor',
  });
});

// ==================== MANEJO DE PROMESAS NO CAPTURADAS ====================

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('🔴 UNCAUGHT EXCEPTION:', error);
});

module.exports = { app, cache };
