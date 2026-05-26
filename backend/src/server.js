const { app } = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3001;

/**
 * Iniciar servidor
 */
const startServer = async () => {
  try {
    // Probar conexión a BD
    console.log('\n📡 Intentando conectar a la base de datos...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('✗ No se pudo conectar a la base de datos. Abortando...');
      process.exit(1);
    }

    // Iniciar servidor Express
    const server = app.listen(PORT, () => {
      console.log(`\n✓ Servidor backend corriendo en http://localhost:${PORT}`);
      console.log(`✓ API disponible en http://localhost:${PORT}/api/solicitudes`);
      console.log(`✓ Health check: http://localhost:${PORT}/health\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n⚠ SIGTERM recibido. Cerrando servidor gracefully...');
      server.close(() => {
        console.log('✓ Servidor cerrado');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⚠ SIGINT recibido. Cerrando servidor...');
      server.close(() => {
        console.log('✓ Servidor cerrado');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('✗ Error al iniciar servidor:', error.message);
    process.exit(1);
  }
};

// Ejecutar si es el archivo principal
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
