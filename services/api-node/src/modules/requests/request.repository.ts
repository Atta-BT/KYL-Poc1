import { pool } from "../../db/pool.js";
import { HttpError } from "../../utils/httpError.js";
import type {
  ListRequestParams,
  RequestPayload,
  ServiceRequest
} from "./request.types.js";

type RequestRow = {
  id: string;
  request_no: string;
  title: string;
  request_type: ServiceRequest["requestType"];
  requester_name: string;
  requester_email: string;
  detail: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

const toRequest = (row: RequestRow): ServiceRequest => ({
  id: row.id,
  requestNo: row.request_no,
  title: row.title,
  requestType: row.request_type,
  requesterName: row.requester_name,
  requesterEmail: row.requester_email,
  detail: row.detail,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
  deletedAt: row.deleted_at ? row.deleted_at.toISOString() : null
});

const buildListFilter = (params: ListRequestParams) => {
  const clauses = ["deleted_at IS NULL"];
  const values: unknown[] = [];

  if (params.search) {
    values.push(`%${params.search}%`);
    const index = values.length;
    clauses.push(`(
      request_no ILIKE $${index}
      OR title ILIKE $${index}
      OR requester_name ILIKE $${index}
      OR requester_email ILIKE $${index}
    )`);
  }

  if (params.type) {
    values.push(params.type);
    clauses.push(`request_type = $${values.length}`);
  }

  return {
    whereSql: clauses.join(" AND "),
    values
  };
};

export const requestRepository = {
  async list(params: ListRequestParams) {
    const { whereSql, values } = buildListFilter(params);
    const offset = (params.page - 1) * params.pageSize;

    const countResult = await pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM service_requests WHERE ${whereSql}`,
      values
    );

    const result = await pool.query<RequestRow>(
      `SELECT *
       FROM service_requests
       WHERE ${whereSql}
       ORDER BY created_at DESC, request_no DESC
       LIMIT $${values.length + 1}
       OFFSET $${values.length + 2}`,
      [...values, params.pageSize, offset]
    );

    return {
      data: result.rows.map(toRequest),
      total: Number(countResult.rows[0]?.total ?? 0)
    };
  },

  async findById(id: string) {
    const result = await pool.query<RequestRow>(
      `SELECT *
       FROM service_requests
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    return result.rows[0] ? toRequest(result.rows[0]) : null;
  },

  async create(payload: RequestPayload) {
    const result = await pool.query<RequestRow>(
      `INSERT INTO service_requests
        (title, request_type, requester_name, requester_email, detail)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        payload.title,
        payload.requestType,
        payload.requesterName,
        payload.requesterEmail,
        payload.detail
      ]
    );

    return toRequest(result.rows[0]);
  },

  async update(id: string, payload: RequestPayload) {
    const result = await pool.query<RequestRow>(
      `UPDATE service_requests
       SET
        title = $2,
        request_type = $3,
        requester_name = $4,
        requester_email = $5,
        detail = $6
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [
        id,
        payload.title,
        payload.requestType,
        payload.requesterName,
        payload.requesterEmail,
        payload.detail
      ]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, "ไม่พบ Request ที่ต้องการแก้ไข");
    }

    return toRequest(result.rows[0]);
  },

  async softDelete(id: string) {
    const result = await pool.query<RequestRow>(
      `UPDATE service_requests
       SET deleted_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, "ไม่พบ Request ที่ต้องการลบ");
    }

    return toRequest(result.rows[0]);
  }
};

