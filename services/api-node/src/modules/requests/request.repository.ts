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
  request_type_id: number;
  request_type_name: ServiceRequest["requestType"];
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
  requestType: row.request_type_name,
  requesterName: row.requester_name,
  requesterEmail: row.requester_email,
  detail: row.detail,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
  deletedAt: row.deleted_at ? row.deleted_at.toISOString() : null
});

const buildListFilter = (params: ListRequestParams, userContext?: { role: string; email: string }) => {
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
    clauses.push(
      `request_type_id = (SELECT id FROM request_types WHERE name = $${values.length})`
    );
  }

  if (userContext && (userContext.role === "student" || userContext.role === "user")) {
    values.push(userContext.email);
    clauses.push(`requester_email = $${values.length}`);
  }

  return {
    whereSql: clauses.join(" AND "),
    values
  };
};

export const requestRepository = {
  async list(params: ListRequestParams, userContext?: { role: string; email: string }) {
    const { whereSql, values } = buildListFilter(params, userContext);
    const offset = (params.page - 1) * params.pageSize;

    const countResult = await pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM service_requests WHERE ${whereSql}`,
      values
    );

    const result = await pool.query<RequestRow>(
      `SELECT sr.*, rt.name AS request_type_name
       FROM service_requests sr
       JOIN request_types rt ON rt.id = sr.request_type_id
       WHERE ${whereSql}
       ORDER BY sr.created_at DESC, sr.request_no DESC
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
      `SELECT sr.*, rt.name AS request_type_name
       FROM service_requests sr
       JOIN request_types rt ON rt.id = sr.request_type_id
       WHERE sr.id = $1 AND sr.deleted_at IS NULL`,
      [id]
    );

    return result.rows[0] ? toRequest(result.rows[0]) : null;
  },

  async create(payload: RequestPayload) {
    const result = await pool.query<RequestRow>(
      `WITH inserted AS (
         INSERT INTO service_requests
           (title, request_type_id, requester_name, requester_email, detail)
         VALUES (
           $1,
           (SELECT id FROM request_types WHERE name = $2),
           $3, $4, $5
         )
         RETURNING *
       )
       SELECT i.*, rt.name AS request_type_name
       FROM inserted i
       JOIN request_types rt ON rt.id = i.request_type_id`,
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
      `WITH updated AS (
         UPDATE service_requests
         SET
           title           = $2,
           request_type_id = (SELECT id FROM request_types WHERE name = $3),
           requester_name  = $4,
           requester_email = $5,
           detail          = $6
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *
       )
       SELECT u.*, rt.name AS request_type_name
       FROM updated u
       JOIN request_types rt ON rt.id = u.request_type_id`,
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
      `WITH deleted_row AS (
         UPDATE service_requests
         SET deleted_at = now()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *
       )
       SELECT d.*, rt.name AS request_type_name
       FROM deleted_row d
       JOIN request_types rt ON rt.id = d.request_type_id`,
      [id]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, "ไม่พบ Request ที่ต้องการลบ");
    }

    return toRequest(result.rows[0]);
  }
};

