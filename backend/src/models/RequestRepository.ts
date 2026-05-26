import { query, getDbClient } from '../config/database';
import type {
  Request,
  CreateRequestDTO,
  RequestFilters,
  RequestStatus,
  StatusHistoryEntry,
} from '../types/request';

const TABLE = 'reto_c.requests';
const HISTORY_TABLE = 'reto_c.request_status_history';

export class RequestRepository {
  async findAll(filters?: RequestFilters): Promise<Request[]> {
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let idx = 1;

    if (filters?.type) {
      conditions.push(`type = $${idx++}`);
      params.push(filters.type);
    }

    if (filters?.urgency) {
      conditions.push(`urgency = $${idx++}`);
      params.push(filters.urgency);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM ${TABLE} ${where} ORDER BY created_at DESC`;
    const result = await query<Request>(sql, params);
    return result.rows;
  }

  async findById(id: number): Promise<Request | null> {
    const sql = `SELECT * FROM ${TABLE} WHERE id = $1`;
    const result = await query<Request>(sql, [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateRequestDTO): Promise<Request> {
    const sql = `
      INSERT INTO ${TABLE} (type, urgency, description, requester, area, status)
      VALUES ($1, $2, $3, $4, $5, 'Recibida')
      RETURNING *
    `;
    const result = await query<Request>(sql, [
      data.type,
      data.urgency,
      data.description,
      data.requester,
      data.area,
    ]);
    return result.rows[0];
  }

  async updateStatus(
    id: number,
    status: RequestStatus,
    comment?: string,
    changedBy?: string
  ): Promise<Request | null> {
    const client = await getDbClient();
    try {
      await client.query('BEGIN');

      // Fetch current status before updating
      const currentResult = await client.query<Request>(
        `SELECT status FROM ${TABLE} WHERE id = $1`,
        [id]
      );
      if (currentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      const previousStatus = currentResult.rows[0].status;

      // Update the request status
      const updateResult = await client.query<Request>(
        `UPDATE ${TABLE} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id]
      );
      const updated = updateResult.rows[0];

      // Insert history record
      await client.query(
        `INSERT INTO ${HISTORY_TABLE} (request_id, previous_status, new_status, comment, changed_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, previousStatus, status, comment ?? null, changedBy ?? 'system']
      );

      await client.query('COMMIT');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findHistory(requestId: number): Promise<StatusHistoryEntry[]> {
    const sql = `
      SELECT * FROM ${HISTORY_TABLE}
      WHERE request_id = $1
      ORDER BY changed_at DESC
    `;
    const result = await query<StatusHistoryEntry>(sql, [requestId]);
    return result.rows;
  }
}

export const requestRepository = new RequestRepository();
