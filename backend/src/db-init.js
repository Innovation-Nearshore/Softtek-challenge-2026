const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Admin123',
});

async function init() {
  const client = await pool.connect();
  try {
    console.log('Starting database initialization...');

    // Drop and recreate schema
    await client.query('DROP SCHEMA IF EXISTS reto_c CASCADE');
    await client.query('CREATE SCHEMA reto_c');
    await client.query("SET search_path TO reto_c");
    console.log('Schema reto_c created.');

    // Create areas table
    await client.query(`
      CREATE TABLE reto_c.areas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        email_contacto VARCHAR(255)
      )
    `);

    // Create tipos_solicitud table
    await client.query(`
      CREATE TABLE reto_c.tipos_solicitud (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        sla_horas INTEGER DEFAULT 48,
        requiere_aprobacion BOOLEAN DEFAULT FALSE
      )
    `);

    // Create solicitudes table
    await client.query(`
      CREATE TABLE reto_c.solicitudes (
        id SERIAL PRIMARY KEY,
        numero_ticket VARCHAR(20) NOT NULL UNIQUE,
        tipo_solicitud_id INTEGER NOT NULL REFERENCES reto_c.tipos_solicitud(id),
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        urgencia VARCHAR(10) NOT NULL CHECK (urgencia IN ('Alta', 'Media', 'Baja')),
        estado VARCHAR(20) NOT NULL DEFAULT 'Recibida'
          CHECK (estado IN ('Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada')),
        solicitante VARCHAR(100) NOT NULL,
        email_solicitante VARCHAR(255) NOT NULL,
        area_solicitante_id INTEGER NOT NULL REFERENCES reto_c.areas(id),
        area_asignada_id INTEGER REFERENCES reto_c.areas(id),
        asignado_a VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_vencimiento TIMESTAMP,
        fecha_resolucion TIMESTAMP,
        solucion TEXT,
        calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
        comentario_calificacion TEXT
      )
    `);

    // Create historial_solicitudes table
    await client.query(`
      CREATE TABLE reto_c.historial_solicitudes (
        id SERIAL PRIMARY KEY,
        solicitud_id INTEGER NOT NULL REFERENCES reto_c.solicitudes(id) ON DELETE CASCADE,
        estado_anterior VARCHAR(20),
        estado_nuevo VARCHAR(20) NOT NULL,
        usuario VARCHAR(100) NOT NULL,
        comentario TEXT,
        fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    await client.query('CREATE INDEX idx_solicitudes_estado ON reto_c.solicitudes(estado)');
    await client.query('CREATE INDEX idx_solicitudes_urgencia ON reto_c.solicitudes(urgencia)');
    await client.query('CREATE INDEX idx_solicitudes_tipo ON reto_c.solicitudes(tipo_solicitud_id)');
    await client.query('CREATE INDEX idx_solicitudes_area ON reto_c.solicitudes(area_solicitante_id)');
    await client.query('CREATE INDEX idx_solicitudes_fecha ON reto_c.solicitudes(fecha_creacion)');
    await client.query('CREATE INDEX idx_historial_solicitud ON reto_c.historial_solicitudes(solicitud_id)');
    console.log('Tables and indexes created.');

    // Seed areas
    await client.query(`
      INSERT INTO reto_c.areas (nombre, descripcion, email_contacto) VALUES
      ('Administración', 'Servicios generales y gestión administrativa', 'admin@empresa.com'),
      ('Compras', 'Adquisiciones y gestión de proveedores', 'compras@empresa.com'),
      ('Finanzas', 'Contabilidad, tesorería y control financiero', 'finanzas@empresa.com'),
      ('Legal', 'Contratos, cumplimiento y gestión legal', 'legal@empresa.com'),
      ('Marketing', 'Comunicación, marca y estrategia comercial', 'marketing@empresa.com'),
      ('Operaciones', 'Logística, producción y cadena de suministro', 'operaciones@empresa.com'),
      ('Recursos Humanos', 'Gestión de talento, nómina y bienestar', 'rrhh@empresa.com'),
      ('Tecnología', 'Infraestructura, desarrollo y soporte técnico', 'ti@empresa.com')
    `);
    console.log('Areas seeded.');

    // Seed tipos_solicitud
    await client.query(`
      INSERT INTO reto_c.tipos_solicitud (codigo, nombre, descripcion, sla_horas, requiere_aprobacion) VALUES
      ('AD-ESP', 'Reserva de espacio', 'Sala de reuniones o auditorio', 12, FALSE),
      ('AD-SUM', 'Solicitud de suministros', 'Materiales de oficina o consumibles', 48, FALSE),
      ('CM-COM', 'Solicitud de compra', 'Compra de bienes o servicios', 120, TRUE),
      ('FN-REE', 'Reembolso de gastos', 'Solicitud de reembolso por gastos realizados', 72, TRUE),
      ('MK-MAT', 'Material promocional', 'Diseño o producción de material', 96, FALSE),
      ('RH-CER', 'Certificación laboral', 'Carta laboral o certificado de trabajo', 48, FALSE),
      ('RH-PER', 'Solicitud de permiso', 'Permiso por motivos personales', 12, TRUE),
      ('RH-VAC', 'Solicitud de vacaciones', 'Solicitud de días de vacaciones', 24, TRUE),
      ('TI-ACC', 'Acceso a sistemas', 'Solicitud de acceso a aplicaciones o sistemas', 24, TRUE),
      ('TI-SOP', 'Soporte técnico', 'Incidente o problema técnico', 4, FALSE)
    `);
    console.log('Tipos de solicitud seeded.');

    // Helper to get IDs
    const areaId = async (nombre) => {
      const r = await client.query('SELECT id FROM reto_c.areas WHERE nombre=$1', [nombre]);
      return r.rows[0].id;
    };
    const tipoId = async (codigo) => {
      const r = await client.query('SELECT id FROM reto_c.tipos_solicitud WHERE codigo=$1', [codigo]);
      return r.rows[0].id;
    };

    // Seed solicitudes - Recibidas
    const recibidas = [
      {
        ticket: 'TK2605-001', tipo: 'TI-SOP',
        titulo: 'No puedo imprimir desde mi computador',
        descripcion: 'Al intentar imprimir sale error de spooler',
        urgencia: 'Media', solicitante: 'Mónica Rivera',
        email: 'monica.rivera@empresa.com', area: 'Operaciones',
        fecha: '2026-05-22 16:00:00', vence: '2026-05-22 20:00:00'
      },
      {
        ticket: 'TK2605-002', tipo: 'AD-SUM',
        titulo: 'Papel higiénico y toallas baño piso 3',
        descripcion: 'Baños del tercer piso sin insumos',
        urgencia: 'Baja', solicitante: 'Jaime Rueda',
        email: 'jaime.rueda@empresa.com', area: 'Operaciones',
        fecha: '2026-05-22 16:15:00', vence: '2026-05-24 16:15:00'
      },
      {
        ticket: 'TK2605-003', tipo: 'RH-CER',
        titulo: 'Certificado de ingresos para crédito',
        descripcion: 'Necesito certificación para solicitud de préstamo hipotecario',
        urgencia: 'Media', solicitante: 'Karina Escobar',
        email: 'karina.escobar@empresa.com', area: 'Marketing',
        fecha: '2026-05-22 16:30:00', vence: '2026-05-24 16:30:00'
      },
      {
        ticket: 'TK2605-004', tipo: 'AD-ESP',
        titulo: 'Parqueadero visitante para mañana',
        descripcion: 'Cliente extranjero viene mañana 10am',
        urgencia: 'Alta', solicitante: 'Fabián Ochoa',
        email: 'fabian.ochoa@empresa.com', area: 'Marketing',
        fecha: '2026-05-22 16:45:00', vence: '2026-05-22 16:45:00'
      },
    ];

    for (const s of recibidas) {
      const aId = await areaId(s.area);
      const tId = await tipoId(s.tipo);
      const r = await client.query(
        `INSERT INTO reto_c.solicitudes
           (numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado,
            solicitante, email_solicitante, area_solicitante_id, fecha_creacion, fecha_vencimiento)
         VALUES ($1,$2,$3,$4,$5,'Recibida',$6,$7,$8,$9,$10) RETURNING id`,
        [s.ticket, tId, s.titulo, s.descripcion, s.urgencia, s.solicitante, s.email, aId, s.fecha, s.vence]
      );
      await client.query(
        `INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
         VALUES ($1, NULL, 'Recibida', $2, 'Solicitud creada', $3)`,
        [r.rows[0].id, s.solicitante, s.fecha]
      );
    }
    console.log('Recibidas seeded.');

    // Seed solicitudes - En revisión
    const enRevision = [
      {
        ticket: 'TK2605-005', tipo: 'CM-COM',
        titulo: 'Compra servidores para expansión',
        descripcion: 'Requerimos 3 servidores Dell PowerEdge para nuevo datacenter',
        urgencia: 'Alta', solicitante: 'Cristina Osorio',
        email: 'cristina.osorio@empresa.com', area: 'Tecnología',
        areaAsignada: 'Compras', asignadoA: 'Elena Mora',
        fecha: '2026-05-16 09:30:00', vence: '2026-05-21 09:30:00'
      },
      {
        ticket: 'TK2605-006', tipo: 'FN-REE',
        titulo: 'Reembolso gastos viaje internacional',
        descripcion: 'Viáticos y gastos de viaje a Miami por $1,850',
        urgencia: 'Alta', solicitante: 'Andrea Beltrán',
        email: 'andrea.beltran@empresa.com', area: 'Marketing',
        areaAsignada: 'Finanzas', asignadoA: 'Carmen Díaz',
        fecha: '2026-05-20 13:30:00', vence: '2026-05-23 13:30:00'
      },
      {
        ticket: 'TK2605-007', tipo: 'RH-VAC',
        titulo: 'Vacaciones junio 10-24',
        descripcion: 'Dos semanas de vacaciones en junio',
        urgencia: 'Media', solicitante: 'Pablo Quintero',
        email: 'pablo.quintero@empresa.com', area: 'Operaciones',
        areaAsignada: 'Recursos Humanos', asignadoA: 'Ana Rodríguez',
        fecha: '2026-05-21 14:00:00', vence: '2026-05-22 14:00:00'
      },
    ];

    for (const s of enRevision) {
      const aId = await areaId(s.area);
      const aaId = await areaId(s.areaAsignada);
      const tId = await tipoId(s.tipo);
      const r = await client.query(
        `INSERT INTO reto_c.solicitudes
           (numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado,
            solicitante, email_solicitante, area_solicitante_id, area_asignada_id,
            asignado_a, fecha_creacion, fecha_vencimiento)
         VALUES ($1,$2,$3,$4,$5,'En revisión',$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [s.ticket, tId, s.titulo, s.descripcion, s.urgencia, s.solicitante, s.email, aId, aaId, s.asignadoA, s.fecha, s.vence]
      );
      const sid = r.rows[0].id;
      await client.query(
        `INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
         VALUES ($1, NULL, 'Recibida', $2, 'Solicitud creada', $3)`,
        [sid, s.solicitante, s.fecha]
      );
      await client.query(
        `INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
         VALUES ($1, 'Recibida', 'En revisión', $2, 'Solicitud tomada en revisión', $3::timestamp + interval '30 minutes')`,
        [sid, s.asignadoA, s.fecha]
      );
    }
    console.log('En revisión seeded.');

    // Seed solicitudes - Resueltas
    const resueltas = [
      {
        ticket: 'TK2601-001', tipo: 'RH-PER',
        titulo: 'Permiso médico urgente',
        descripcion: 'Solicito permiso para cita médica especializada',
        urgencia: 'Alta', solicitante: 'Carlos Méndez',
        email: 'carlos.mendez@empresa.com', area: 'Operaciones',
        areaAsignada: 'Recursos Humanos', asignadoA: 'Ana Rodríguez',
        fecha: '2026-01-15 09:30:00', vence: '2026-01-15 21:30:00',
        resolucion: '2026-01-15 11:20:00',
        solucion: 'Permiso aprobado. Registrado en sistema de nómina.', cal: 5
      },
      {
        ticket: 'TK2601-002', tipo: 'TI-SOP',
        titulo: 'Problema con acceso a VPN',
        descripcion: 'No puedo conectarme a la VPN desde casa',
        urgencia: 'Media', solicitante: 'Laura Gómez',
        email: 'laura.gomez@empresa.com', area: 'Finanzas',
        areaAsignada: 'Tecnología', asignadoA: 'Pedro Silva',
        fecha: '2026-01-16 08:15:00', vence: '2026-01-16 12:15:00',
        resolucion: '2026-01-16 10:45:00',
        solucion: 'Se reconfiguró el cliente VPN y se actualizaron credenciales.', cal: 4
      },
      {
        ticket: 'TK2601-003', tipo: 'RH-CER',
        titulo: 'Certificado laboral para banco',
        descripcion: 'Requiero certificación de ingresos para trámite bancario',
        urgencia: 'Media', solicitante: 'Valentina Herrera',
        email: 'valentina.herrera@empresa.com', area: 'Tecnología',
        areaAsignada: 'Recursos Humanos', asignadoA: 'Ana Rodríguez',
        fecha: '2026-02-05 10:15:00', vence: '2026-02-07 10:15:00',
        resolucion: '2026-02-06 14:20:00',
        solucion: 'Certificado emitido y enviado al correo del solicitante.', cal: 5
      },
    ];

    for (const s of resueltas) {
      const aId = await areaId(s.area);
      const aaId = await areaId(s.areaAsignada);
      const tId = await tipoId(s.tipo);
      const r = await client.query(
        `INSERT INTO reto_c.solicitudes
           (numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado,
            solicitante, email_solicitante, area_solicitante_id, area_asignada_id,
            asignado_a, fecha_creacion, fecha_vencimiento, fecha_resolucion, solucion, calificacion)
         VALUES ($1,$2,$3,$4,$5,'Resuelta',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
        [s.ticket, tId, s.titulo, s.descripcion, s.urgencia, s.solicitante, s.email,
         aId, aaId, s.asignadoA, s.fecha, s.vence, s.resolucion, s.solucion, s.cal]
      );
      const sid = r.rows[0].id;
      await client.query(
        `INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
         VALUES ($1, NULL, 'Recibida', $2, 'Solicitud creada', $3)`,
        [sid, s.solicitante, s.fecha]
      );
      await client.query(
        `INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
         VALUES ($1, 'Recibida', 'En revisión', $2, 'Solicitud tomada en revisión', $3::timestamp + interval '30 minutes')`,
        [sid, s.asignadoA, s.fecha]
      );
      await client.query(
        `INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
         VALUES ($1, 'En revisión', 'Resuelta', $2, $3, $4)`,
        [sid, s.asignadoA, s.solucion, s.resolucion]
      );
    }
    console.log('Resueltas seeded.');

    // Verify final counts
    const counts = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM reto_c.areas) as areas,
        (SELECT COUNT(*) FROM reto_c.tipos_solicitud) as tipos,
        (SELECT COUNT(*) FROM reto_c.solicitudes) as solicitudes,
        (SELECT COUNT(*) FROM reto_c.historial_solicitudes) as historial
    `);
    console.log('\n=== Final row counts ===');
    console.log(' areas:', counts.rows[0].areas);
    console.log(' tipos_solicitud:', counts.rows[0].tipos);
    console.log(' solicitudes:', counts.rows[0].solicitudes);
    console.log(' historial_solicitudes:', counts.rows[0].historial);
    console.log('\nDatabase initialization complete!');
  } catch (err) {
    console.error('INIT ERROR:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
