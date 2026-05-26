import { Pool } from 'pg';
import { env } from './env';

export const verifyDatabaseConnection = async (): Promise<boolean> => {
  const testPool = new Pool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await testPool.connect();
    console.log('✓ Database connection successful');

    // Verify schema exists
    const schemaResult = await client.query(`
      SELECT schema_name FROM information_schema.schemata
      WHERE schema_name = $1
    `, [env.db.schema]);

    if (schemaResult.rows.length === 0) {
      console.warn(`⚠ Warning: Schema '${env.db.schema}' does not exist yet`);
      console.log(`  Run the following SQL to create it:`);
      console.log(`  CREATE SCHEMA ${env.db.schema};`);
    } else {
      console.log(`✓ Schema '${env.db.schema}' exists`);
    }

    client.release();
    await testPool.end();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed');
    console.error(error instanceof Error ? error.message : String(error));
    return false;
  }
};
