import { Pool, PoolClient } from 'pg';
import type { QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export const getDbClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log('Slow query detected:', { text, duration, params });
    }
    return result;
  } catch (error) {
    console.error('Database query error:', { text, params, error });
    throw error;
  }
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};

export default pool;
