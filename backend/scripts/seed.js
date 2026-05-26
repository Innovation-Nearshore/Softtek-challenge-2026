/* eslint-disable */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin123',
  database: process.env.DB_NAME || 'ai_challenge',
});

const mockRequests = [
  {
    type: 'Soporte Técnico',
    urgency: 'Alta',
    description: 'El sistema de nómina no permite generar recibos de pago para el período actual. Se necesita solución urgente antes del cierre de quincena.',
    requester: 'María González',
    area: 'Recursos Humanos',
    status: 'Recibida',
  },
  {
    type: 'Aprobación',
    urgency: 'Media',
    description: 'Solicito aprobación para la compra de 10 licencias adicionales de Microsoft Office 365 para el equipo de ventas.',
    requester: 'Carlos Mendoza',
    area: 'Ventas',
    status: 'En revisión',
  },
  {
    type: 'Requerimiento',
    urgency: 'Baja',
    description: 'Se requiere integrar el módulo de reportes con la nueva herramienta de Business Intelligence adquirida el mes pasado.',
    requester: 'Ana Ramírez',
    area: 'Tecnología',
    status: 'Resuelta',
  },
  {
    type: 'Soporte Técnico',
    urgency: 'Alta',
    description: 'Falla en el servidor de producción que impide el acceso al portal de clientes. Clientes reportan error 503 desde las 8am.',
    requester: 'Luis Hernández',
    area: 'Operaciones',
    status: 'En revisión',
  },
  {
    type: 'Aprobación',
    urgency: 'Alta',
    description: 'Requiero autorización urgente para contratar un servicio de mensajería externa durante el período de alta demanda navideña.',
    requester: 'Patricia Torres',
    area: 'Logística',
    status: 'Recibida',
  },
  {
    type: 'Requerimiento',
    urgency: 'Media',
    description: 'Desarrollo de un formulario web para que los empleados puedan registrar sus horas extras directamente desde el portal interno.',
    requester: 'Roberto Jiménez',
    area: 'Recursos Humanos',
    status: 'En revisión',
  },
  {
    type: 'Soporte Técnico',
    urgency: 'Baja',
    description: 'El proyector de la sala de juntas principal no conecta con laptops mediante HDMI. Se necesita revisión de cable o adaptador.',
    requester: 'Sofía Castro',
    area: 'Administración',
    status: 'Resuelta',
  },
  {
    type: 'Aprobación',
    urgency: 'Media',
    description: 'Solicitud de aprobación para realizar capacitación en línea sobre ciberseguridad para todos los empleados del área de finanzas.',
    requester: 'Diego Morales',
    area: 'Finanzas',
    status: 'Recibida',
  },
  {
    type: 'Requerimiento',
    urgency: 'Alta',
    description: 'Implementar autenticación de dos factores (2FA) en todos los sistemas internos. Auditoría de seguridad detectó vulnerabilidad crítica.',
    requester: 'Valeria Ruiz',
    area: 'Tecnología',
    status: 'En revisión',
  },
  {
    type: 'Soporte Técnico',
    urgency: 'Media',
    description: 'Los correos del dominio corporativo están llegando a la carpeta de spam en clientes externos. Revisar configuración SPF/DKIM.',
    requester: 'Fernando López',
    area: 'Marketing',
    status: 'Recibida',
  },
  {
    type: 'Aprobación',
    urgency: 'Baja',
    description: 'Solicito aprobación para rediseñar la imagen corporativa de los materiales de presentación para clientes del sector retail.',
    requester: 'Isabella Flores',
    area: 'Marketing',
    status: 'Resuelta',
  },
  {
    type: 'Requerimiento',
    urgency: 'Media',
    description: 'Se requiere habilitar acceso VPN para 5 colaboradores que trabajarán de forma remota permanente según nuevo esquema híbrido.',
    requester: 'Andrés Vargas',
    area: 'Tecnología',
    status: 'Resuelta',
  },
  {
    type: 'Soporte Técnico',
    urgency: 'Alta',
    description: 'Base de datos de inventario presenta inconsistencias en los registros de stock. Los números no coinciden con el conteo físico realizado ayer.',
    requester: 'Carmen Ortega',
    area: 'Almacén',
    status: 'En revisión',
  },
  {
    type: 'Aprobación',
    urgency: 'Media',
    description: 'Aprobación requerida para implementar política de trabajo desde casa los viernes para el equipo de desarrollo de software.',
    requester: 'Javier Medina',
    area: 'Desarrollo',
    status: 'Recibida',
  },
  {
    type: 'Requerimiento',
    urgency: 'Baja',
    description: 'Crear un dashboard ejecutivo en Power BI que consolide los KPIs de ventas, operaciones y finanzas en una sola vista.',
    requester: 'Lucía Peña',
    area: 'Dirección General',
    status: 'Recibida',
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    // Idempotent: only insert if table is empty
    const countRes = await client.query('SELECT COUNT(*) FROM reto_c.requests');
    const count = parseInt(countRes.rows[0].count, 10);

    if (count >= 15) {
      console.log(`ℹ️  Table already has ${count} row(s). Skipping seed to avoid duplicates.`);
      return;
    }

    console.log('🌱 Seeding 15 mock requests...');

    for (const req of mockRequests) {
      await client.query(
        `INSERT INTO reto_c.requests (type, urgency, description, requester, area, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.type, req.urgency, req.description, req.requester, req.area, req.status]
      );
    }

    console.log('✅ Seed completed — 15 requests inserted.');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
