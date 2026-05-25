const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ai_challenge',
  user: 'postgres',
  password: 'admin'
});

async function checkDatabase() {
  console.log('=== DIAGNÓSTICO DE BASE DE DATOS ===\n');
  
  try {
    // 1. Listar todos los esquemas
    console.log('1. ESQUEMAS DISPONIBLES:');
    const schemasResult = await pool.query(`
      SELECT schema_name FROM information_schema.schemata 
      ORDER BY schema_name
    `);
    console.log('Esquemas encontrados:', schemasResult.rows.map(r => r.schema_name).join(', '));
    
    // 2. Verificar si existe el esquema reto_d
    const retoSchema = schemasResult.rows.find(r => r.schema_name === 'reto_d');
    console.log(`\nReto_d existe: ${retoSchema ? 'SÍ' : 'NO'}\n`);
    
    if (retoSchema) {
      // 3. Listar tablas en reto_d
      console.log('2. TABLAS EN ESQUEMA RETO_D:');
      const tablesResult = await pool.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'reto_d'
        ORDER BY table_name
      `);
      
      if (tablesResult.rows.length === 0) {
        console.log('No se encontraron tablas en reto_d');
      } else {
        console.log(`Tablas encontradas: ${tablesResult.rows.map(r => r.table_name).join(', ')}`);
        
        // 4. Describir columnas de cada tabla
        for (const table of tablesResult.rows) {
          console.log(`\n3. COLUMNAS DE reto_d.${table.table_name}:`);
          const columnsResult = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'reto_d' AND table_name = $1
            ORDER BY ordinal_position
          `, [table.table_name]);
          
          columnsResult.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
          });
        }
        
        // 5. Contar registros
        console.log('\n4. CONTEO DE REGISTROS:');
        for (const table of tablesResult.rows) {
          const countResult = await pool.query(`SELECT COUNT(*) as count FROM reto_d.${table.table_name}`);
          console.log(`  - reto_d.${table.table_name}: ${countResult.rows[0].count} registros`);
        }
      }
    } else {
      console.log('2. El esquema reto_d NO EXISTE. Se necesita crear.');
    }
    
    console.log('\n=== FIN DEL DIAGNÓSTICO ===');
  } catch (error) {
    console.error('ERROR durante diagnóstico:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
