const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ai_challenge',
  user: 'postgres',
  password: 'admin'
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('=== INICIANDO MIGRACIÓN ===\n');
    
    // 1. Crear esquema
    console.log('1. Creando esquema reto_d...');
    await client.query('DROP SCHEMA IF EXISTS reto_d CASCADE');
    await client.query('CREATE SCHEMA reto_d');
    console.log('   ✓ Esquema creado\n');
    
    // 2. Crear tabla categorias
    console.log('2. Creando tabla reto_d.categorias...');
    await client.query(`
      CREATE TABLE reto_d.categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        descripcion TEXT
      )
    `);
    console.log('   ✓ Tabla categorias creada\n');
    
    // 3. Crear tabla incidentes
    console.log('3. Creando tabla reto_d.incidentes...');
    await client.query(`
      CREATE TABLE reto_d.incidentes (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        categoria_id INTEGER NOT NULL REFERENCES reto_d.categorias(id),
        severidad VARCHAR(10) NOT NULL CHECK (severidad IN ('Crítica', 'Alta', 'Media', 'Baja')),
        descripcion TEXT,
        reportador VARCHAR(100) NOT NULL,
        area_afectada VARCHAR(50) NOT NULL,
        estado VARCHAR(15) NOT NULL CHECK (estado IN ('Abierto', 'En atención', 'Cerrado')),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`CREATE INDEX idx_incidentes_estado ON reto_d.incidentes(estado)`);
    await client.query(`CREATE INDEX idx_incidentes_severidad ON reto_d.incidentes(severidad)`);
    await client.query(`CREATE INDEX idx_incidentes_categoria ON reto_d.incidentes(categoria_id)`);
    await client.query(`CREATE INDEX idx_incidentes_area ON reto_d.incidentes(area_afectada)`);
    console.log('   ✓ Tabla incidentes creada con índices\n');
    
    // 4. Crear tabla incident_log
    console.log('4. Creando tabla reto_d.incident_log...');
    await client.query(`
      CREATE TABLE reto_d.incident_log (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER NOT NULL REFERENCES reto_d.incidentes(id),
        old_status VARCHAR(15),
        new_status VARCHAR(15) NOT NULL,
        note TEXT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`CREATE INDEX idx_log_incident_id ON reto_d.incident_log(incident_id)`);
    console.log('   ✓ Tabla incident_log creada\n');
    
    // 5. Insertar categorías
    console.log('5. Insertando categorías...');
    await client.query(`
      INSERT INTO reto_d.categorias (nombre, descripcion) VALUES
      ('Sistema', 'Fallas o interrupciones en sistemas o plataformas tecnológicas'),
      ('Proceso', 'Errores, bloqueos o interrupciones en flujos de trabajo o procesos operativos'),
      ('Acceso', 'Problemas de autenticación, permisos o disponibilidad de acceso'),
      ('Datos', 'Inconsistencias, pérdida o corrupción de información'),
      ('Comunicación', 'Fallas en canales de comunicación interna o notificaciones'),
      ('Desempeño', 'Degradación de rendimiento o lentitud de servicios'),
      ('Infraestructura', 'Problemas físicos o de red que afectan la operación'),
      ('Integración', 'Fallas en conexiones o intercambio de datos entre sistemas')
    `);
    console.log('   ✓ 8 categorías insertadas\n');
    
    // 6. Insertar incidentes
    console.log('6. Insertando 18 incidentes...');
    await client.query(`
      INSERT INTO reto_d.incidentes (titulo, categoria_id, severidad, descripcion, reportador, area_afectada, estado, fecha_creacion, fecha_actualizacion) VALUES
      ('Falla total en proceso Alpha — línea detenida', 2, 'Crítica', 'El proceso Alpha dejó de ejecutarse completamente a las 06:15. La línea operativa está detenida y no se puede continuar el ciclo hasta restaurar el servicio. Se desconoce la causa raíz.', 'Carlos Medina', 'Área A', 'Abierto', '2025-05-22 06:20:00', '2025-05-22 06:20:00'),
      ('Interrupción total del sistema Beta', 1, 'Crítica', 'El sistema Beta no responde desde las 08:30. Todos los usuarios del área B reportan error de conexión. El equipo de infraestructura está revisando el servidor de aplicaciones.', 'Laura Ortiz', 'Área B', 'En atención', '2025-05-21 08:35:00', '2025-05-21 09:10:00'),
      ('Pérdida de registros en módulo Épsilon', 4, 'Crítica', 'Se detectó pérdida de aproximadamente 200 registros del módulo Épsilon tras el mantenimiento de anoche. Los datos afectados corresponden al turno nocturno. Impacto directo en reportes de cierre.', 'Diana Salinas', 'Área C', 'Cerrado', '2025-05-19 07:00:00', '2025-05-20 11:30:00'),
      ('Error en flujo de aprobación Gamma', 2, 'Alta', 'El flujo automatizado de aprobaciones Gamma no está enviando las notificaciones de paso al siguiente revisor. Las aprobaciones quedan bloqueadas en el primer nivel sin avanzar.', 'Andrés Parra', 'Área C', 'Abierto', '2025-05-22 09:05:00', '2025-05-22 09:05:00'),
      ('Acceso denegado al módulo Delta para múltiples usuarios', 3, 'Alta', 'Desde las 07:00, doce usuarios del área A no pueden acceder al módulo Delta. El error es "Permiso insuficiente". No hubo cambios de configuración programados para esta semana.', 'Patricia Vega', 'Área A', 'En atención', '2025-05-21 07:15:00', '2025-05-21 07:50:00'),
      ('Inconsistencia en datos de cierre mensual', 4, 'Alta', 'Los datos consolidados del cierre de abril no coinciden con los reportes individuales de cada área. La diferencia asciende a 340 registros con fechas incorrectas. Bloquea el informe ejecutivo.', 'Sergio Lozano', 'Área D', 'Abierto', '2025-05-20 14:00:00', '2025-05-20 14:00:00'),
      ('Falla en integración con sistema externo Zeta', 8, 'Alta', 'La integración automática con el sistema externo Zeta dejó de sincronizar a las 00:00 de ayer. Los datos no se han actualizado en 36 horas. El proveedor externo fue notificado.', 'Elena Mora', 'Área B', 'Cerrado', '2025-05-20 08:00:00', '2025-05-21 16:00:00'),
      ('Caída de conectividad red piso 4', 7, 'Alta', 'El switch del piso 4 presentó falla de hardware a las 11:30. Dieciocho equipos sin conectividad. El equipo de infraestructura solicitó reemplazo del dispositivo al proveedor.', 'Nicolás Castro', 'Área E', 'En atención', '2025-05-22 11:35:00', '2025-05-22 12:00:00'),
      ('Retraso excesivo en generación de reportes', 6, 'Media', 'La generación de reportes del portal está tardando entre 8 y 12 minutos cuando el comportamiento normal es menos de 1 minuto. El problema comenzó el lunes. Afecta a todos los usuarios.', 'Camila Torres', 'Área D', 'Abierto', '2025-05-19 10:00:00', '2025-05-19 10:00:00'),
      ('Notificaciones automáticas no enviadas', 5, 'Media', 'Las alertas programadas de fin de proceso no se están enviando a los destinatarios configurados. Los supervisores reportan que llevan dos días sin recibir los correos automáticos de resumen.', 'Juliana Ríos', 'Área B', 'En atención', '2025-05-21 13:00:00', '2025-05-21 13:45:00'),
      ('Error de visualización en dashboard principal', 1, 'Media', 'El widget de indicadores del dashboard principal muestra valores en cero aunque la base de datos tiene registros actualizados. El problema ocurre en Chrome; en Firefox se visualiza correctamente.', 'Mario Herrera', 'Área F', 'Abierto', '2025-05-22 08:00:00', '2025-05-22 08:00:00'),
      ('Formulario de registro no guarda datos opcionales', 1, 'Media', 'Al completar el formulario de registro con campos opcionales llenos, al guardar dichos campos no se persisten. Los campos obligatorios se guardan correctamente. Reportado por tres usuarios distintos.', 'Valeria Fuentes', 'Área A', 'Cerrado', '2025-05-18 15:00:00', '2025-05-19 10:20:00'),
      ('Lentitud en consultas del módulo de búsqueda', 6, 'Media', 'Las búsquedas en el módulo de consultas tardan más de 30 segundos. En condiciones normales la respuesta es inmediata. El problema escala cuando hay más de 10 usuarios concurrentes.', 'Tomás Aguilar', 'Área C', 'En atención', '2025-05-20 09:30:00', '2025-05-20 10:00:00'),
      ('Archivos adjuntos no se cargan correctamente', 1, 'Media', 'Al intentar adjuntar archivos PDF mayores a 2 MB en el módulo de solicitudes, el sistema muestra error de carga aunque el límite configurado es 10 MB. Archivos menores funcionan bien.', 'Rosa Pineda', 'Área E', 'Cerrado', '2025-05-17 11:00:00', '2025-05-18 09:45:00'),
      ('Etiquetas de interfaz en idioma incorrecto', 1, 'Baja', 'Tras la actualización del viernes, tres pantallas del módulo de configuración muestran etiquetas en inglés en lugar de español. La funcionalidad no está afectada, solo la presentación.', 'Gloria Méndez', 'Área F', 'Abierto', '2025-05-22 07:30:00', '2025-05-22 07:30:00'),
      ('Correos de notificación llegan con formato roto', 5, 'Baja', 'Los correos automáticos de confirmación de registro muestran el HTML sin renderizar — el usuario ve el código fuente en lugar del mensaje formateado. El contenido es correcto pero ilegible.', 'Hernán Quintero', 'Área B', 'En atención', '2025-05-21 16:00:00', '2025-05-21 16:30:00'),
      ('Botón de exportar no genera archivo en Safari', 1, 'Baja', 'El botón "Exportar a CSV" no descarga el archivo cuando se usa Safari en macOS. En Chrome y Firefox funciona correctamente. Afecta a dos usuarios con equipos Mac.', 'Isabel Ramírez', 'Área D', 'Abierto', '2025-05-20 17:00:00', '2025-05-20 17:00:00'),
      ('Paginación muestra número de página incorrecto', 1, 'Baja', 'El contador de páginas en la tabla principal muestra "Página 1 de 0" aunque hay registros visibles. La navegación entre páginas funciona correctamente; es solo un error de visualización del contador.', 'Fabio Guerrero', 'Área C', 'Cerrado', '2025-05-16 10:00:00', '2025-05-17 14:15:00')
    `);
    console.log('   ✓ 18 incidentes insertados\n');
    
    // 7. Insertar incident_log — apertura de todos
    console.log('7. Insertando histórico incident_log...');
    await client.query(`
      INSERT INTO reto_d.incident_log (incident_id, old_status, new_status, note, changed_at)
      SELECT id, NULL, 'Abierto', 'Incidente registrado', fecha_creacion
      FROM reto_d.incidentes
    `);
    
    // Transición Abierto → En atención (para los que están En atención o Cerrado)
    await client.query(`
      INSERT INTO reto_d.incident_log (incident_id, old_status, new_status, note, changed_at)
      SELECT id, 'Abierto', 'En atención', 'Incidente asignado al equipo de respuesta', fecha_creacion + INTERVAL '30 minutes'
      FROM reto_d.incidentes
      WHERE estado IN ('En atención', 'Cerrado')
    `);
    
    // Transición En atención → Cerrado (solo para Cerrados)
    await client.query(`
      INSERT INTO reto_d.incident_log (incident_id, old_status, new_status, note, changed_at)
      SELECT id, 'En atención', 'Cerrado', 'Incidente resuelto y verificado por el área afectada', fecha_actualizacion
      FROM reto_d.incidentes
      WHERE estado = 'Cerrado'
    `);
    console.log('   ✓ Histórico insertado\n');
    
    // 8. Verificación
    console.log('8. Verificación final...');
    const catCount = await client.query('SELECT COUNT(*) FROM reto_d.categorias');
    const incCount = await client.query('SELECT COUNT(*) FROM reto_d.incidentes');
    const logCount = await client.query('SELECT COUNT(*) FROM reto_d.incident_log');
    
    console.log(`   - Categorías: ${catCount.rows[0].count}`);
    console.log(`   - Incidentes: ${incCount.rows[0].count}`);
    console.log(`   - Logs: ${logCount.rows[0].count}\n`);
    
    const stateCount = await client.query(`
      SELECT estado, COUNT(*) AS total
      FROM reto_d.incidentes
      GROUP BY estado
      ORDER BY CASE estado
        WHEN 'Abierto' THEN 1
        WHEN 'En atención' THEN 2
        WHEN 'Cerrado' THEN 3
      END
    `);
    
    console.log('   Distribución de estados:');
    stateCount.rows.forEach(row => {
      console.log(`     - ${row.estado}: ${row.total}`);
    });
    
    console.log('\n=== MIGRACIÓN COMPLETADA CON ÉXITO ===');
  } catch (error) {
    console.error('ERROR durante migración:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Fallo crítico:', err);
  process.exit(1);
});
