import { query } from '../config/database';
import type { DatabaseEntity } from '../types';

export interface RepositoryOptions {
  schema?: string;
  tableName: string;
}

export abstract class BaseRepository<T extends DatabaseEntity> {
  protected schema: string;
  protected tableName: string;

  constructor(options: RepositoryOptions) {
    this.schema = options.schema || 'reto_c';
    this.tableName = options.tableName;
  }

  protected getFullTableName(): string {
    return `${this.schema}."${this.tableName}"`;
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<T[]> {
    const sql = `SELECT * FROM ${this.getFullTableName()} LIMIT $1 OFFSET $2`;
    const result = await query<T>(sql, [limit, offset]);
    return result.rows;
  }

  async findById(id: string): Promise<T | null> {
    const sql = `SELECT * FROM ${this.getFullTableName()} WHERE id = $1`;
    const result = await query<T>(sql, [id]);
    return result.rows[0] || null;
  }

  async count(): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM ${this.getFullTableName()}`;
    const result = await query<{ count: string }>(sql);
    return parseInt(result.rows[0].count, 10);
  }

  abstract create(data: Omit<T, keyof DatabaseEntity>): Promise<T>;
  abstract update(id: string, data: Partial<Omit<T, keyof DatabaseEntity>>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}
