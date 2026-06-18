const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Admin123',
});

async function verify() {
  try {
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'reto_c' ORDER BY table_name"
    );
    console.log('Tables in reto_c schema:');
    result.rows.forEach(r => console.log(' -', r.table_name));

    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM reto_c.areas) as areas,
        (SELECT COUNT(*) FROM reto_c.tipos_solicitud) as tipos,
        (SELECT COUNT(*) FROM reto_c.solicitudes) as solicitudes,
        (SELECT COUNT(*) FROM reto_c.historial_solicitudes) as historial
    `);
    console.log('\nRow counts:');
    console.log(' areas:', counts.rows[0].areas);
    console.log(' tipos_solicitud:', counts.rows[0].tipos);
    console.log(' solicitudes:', counts.rows[0].solicitudes);
    console.log(' historial_solicitudes:', counts.rows[0].historial);
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

verify();
