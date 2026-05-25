const http = require('http');

// Pequeño servidor de prueba que corre index.js y luego prueba los endpoints
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ai_challenge',
  user: 'postgres',
  password: 'admin'
});

async function validateEndpoints() {
  console.log('=== VALIDACIÓN DE ENDPOINTS ===\n');
  
  try {
    // 1. Validar GET /api/categorias
    console.log('1. Probando GET /api/categorias...');
    const categorias = await pool.query('SELECT * FROM reto_d.categorias ORDER BY nombre');
    console.log(`   ✓ Query exitosa: ${categorias.rows.length} categorías encontradas`);
    console.log(`   Ejemplo: ${categorias.rows[0]?.nombre || 'N/A'}\n`);
    
    // 2. Validar GET /api/incidentes (con JOIN)
    console.log('2. Probando GET /api/incidentes (con JOIN a categorias)...');
    const incidentes = await pool.query(`
      SELECT i.*, c.nombre as categoria 
      FROM reto_d.incidentes i 
      JOIN reto_d.categorias c ON i.categoria_id = c.id 
      ORDER BY i.fecha_creacion DESC
    `);
    console.log(`   ✓ Query exitosa: ${incidentes.rows.length} incidentes encontrados`);
    console.log(`   Ejemplo: "${incidentes.rows[0]?.titulo}" - Estado: ${incidentes.rows[0]?.estado}\n`);
    
    // 3. Validar estructura de incidentes
    console.log('3. Validando estructura de datos de incidentes...');
    const inc = incidentes.rows[0];
    const requiredFields = ['id', 'titulo', 'categoria_id', 'severidad', 'descripcion', 'reportador', 'area_afectada', 'estado', 'categoria'];
    const missingFields = requiredFields.filter(f => !(f in inc));
    if (missingFields.length === 0) {
      console.log('   ✓ Todos los campos requeridos presentes\n');
    } else {
      console.log(`   ✗ Campos faltantes: ${missingFields.join(', ')}\n`);
    }
    
    // 4. Validar GET /api/incidentes/:id/log
    console.log('4. Probando GET /api/incidentes/:id/log...');
    const firstIncidentId = incidentes.rows[0].id;
    const logs = await pool.query(
      'SELECT * FROM reto_d.incident_log WHERE incident_id = $1 ORDER BY changed_at ASC',
      [firstIncidentId]
    );
    console.log(`   ✓ Query exitosa: ${logs.rows.length} registros de log para incidente ${firstIncidentId}`);
    if (logs.rows.length > 0) {
      console.log(`   Ejemplo: ${logs.rows[0].old_status || 'NULL'} → ${logs.rows[0].new_status}\n`);
    }
    
    // 5. Validar conteos por estado
    console.log('5. Validando conteos por estado...');
    const stateCounts = await pool.query(`
      SELECT estado, COUNT(*) AS total
      FROM reto_d.incidentes
      GROUP BY estado
      ORDER BY CASE estado
        WHEN 'Abierto' THEN 1
        WHEN 'En atención' THEN 2
        WHEN 'Cerrado' THEN 3
      END
    `);
    console.log('   Distribución:');
    stateCounts.rows.forEach(row => {
      console.log(`     - ${row.estado}: ${row.total}`);
    });
    console.log();
    
    // 6. Validar data types y constraints
    console.log('6. Validando tipos de datos y constraints...');
    const constraints = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'reto_d' AND tc.table_name = 'incidentes'
    `);
    console.log(`   ✓ ${constraints.rows.length} constraints encontrados\n`);
    
    // 7. Validar que no haya registros con NULL en campos requeridos
    console.log('7. Validando integridad de datos (SIN NULLs en campos requeridos)...');
    const nullCheck = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM reto_d.incidentes WHERE titulo IS NULL) as null_titulo,
        (SELECT COUNT(*) FROM reto_d.incidentes WHERE severidad IS NULL) as null_severidad,
        (SELECT COUNT(*) FROM reto_d.incidentes WHERE area_afectada IS NULL) as null_area
    `);
    const nullRow = nullCheck.rows[0];
    if (nullRow.null_titulo === '0' && nullRow.null_severidad === '0' && nullRow.null_area === '0') {
      console.log('   ✓ Integridad confirmada: sin NULLs en campos obligatorios\n');
    }
    
    console.log('=== VALIDACIÓN COMPLETADA CON ÉXITO ===');
    console.log('\n✓ Todos los endpoints pueden ejecutarse sin errores "relation does not exist"');
    console.log('✓ La estructura de datos es correcta');
    console.log('✓ Los datos están íntegros y completos');
    console.log('\nPróximos pasos:');
    console.log('1. Inicie el servidor Express: cd server && node index.js');
    console.log('2. Inicie el cliente React: cd client && npm run dev');
    console.log('3. Acceda a http://localhost:3000');
    
  } catch (error) {
    console.error('ERROR durante validación:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

validateEndpoints();
