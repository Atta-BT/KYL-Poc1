import { pool } from "../../db/pool.js";
import { HttpError } from "../../utils/httpError.js";
import type {
  ListRequestParams,
  RequestPayload,
  RequestStatus,
  ServiceRequest
} from "./request.types.js";
import { getPlugin, plugins } from "./services/registry.js";

/** Base columns owned by the service_requests row (+ joined type name). */
type BaseRow = {
  id: string;
  request_no: string;
  title: string;
  request_type_name: ServiceRequest["requestType"];
  requester_name: string;
  requester_email: string;
  detail: string;
  status: RequestStatus;
  admin_reply: string | null;
  admin_reply_at: Date | null;
  admin_reply_by: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

/** SELECT columns and JOINs contributed by every registered service plugin. */
const serviceSelectColumns = plugins
  .map((plugin) => plugin.selectColumns)
  .join(",\n              ");

const serviceJoins = plugins
  .map((plugin) => plugin.joinClause)
  .join("\n       ");

const toRequest = (row: Record<string, unknown>): ServiceRequest => {
  const base = row as unknown as BaseRow;
  const serviceFields = plugins.reduce(
    (acc, plugin) => ({ ...acc, ...plugin.mapRow(row) }),
    {} as Partial<ServiceRequest>
  );

  return {
    id: base.id,
    requestNo: base.request_no,
    title: base.title,
    requestType: base.request_type_name,
    requesterName: base.requester_name,
    requesterEmail: base.requester_email,
    detail: base.detail,
    status: base.status,
    adminReply: base.admin_reply ?? null,
    adminReplyAt: base.admin_reply_at ? base.admin_reply_at.toISOString() : null,
    adminReplyBy: base.admin_reply_by ?? null,
    createdAt: base.created_at.toISOString(),
    updatedAt: base.updated_at.toISOString(),
    deletedAt: base.deleted_at ? base.deleted_at.toISOString() : null,
    ...serviceFields
  };
};

const buildListFilter = (
  params: ListRequestParams,
  userContext?: { role: string; email: string }
) => {
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

  if (params.status) {
    values.push(params.status);
    clauses.push(`sr.status = $${values.length}`);
  }

  if (
    userContext &&
    (userContext.role === "student" ||
      userContext.role === "staff" ||
      userContext.role === "user")
  ) {
    values.push(userContext.email);
    clauses.push(`requester_email = $${values.length}`);
  }

  return {
    whereSql: clauses.join(" AND "),
    values
  };
};

export const requestRepository = {
  async list(
    params: ListRequestParams,
    userContext?: { role: string; email: string }
  ) {
    const { whereSql, values } = buildListFilter(params, userContext);
    const offset = (params.page - 1) * params.pageSize;

    const countResult = await pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM service_requests sr WHERE ${whereSql}`,
      values
    );

    const result = await pool.query(
      `SELECT sr.*, rt.name AS request_type_name,
              ${serviceSelectColumns}
       FROM service_requests sr
       JOIN request_types rt ON rt.id = sr.request_type_id
       ${serviceJoins}
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
    const result = await pool.query(
      `SELECT sr.*, rt.name AS request_type_name,
              ${serviceSelectColumns}
       FROM service_requests sr
       JOIN request_types rt ON rt.id = sr.request_type_id
       ${serviceJoins}
       WHERE sr.id = $1 AND sr.deleted_at IS NULL`,
      [id]
    );

    return result.rows[0] ? toRequest(result.rows[0]) : null;
  },

  async create(payload: RequestPayload) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertRequestRes = await client.query<{ id: string }>(
        `INSERT INTO service_requests
           (title, request_type_id, requester_name, requester_email, detail)
         VALUES (
           $1,
           (SELECT id FROM request_types WHERE name = $2),
           $3, $4, $5
         )
         RETURNING id`,
        [
          payload.title,
          payload.requestType,
          payload.requesterName,
          payload.requesterEmail,
          payload.detail
        ]
      );
      const requestId = insertRequestRes.rows[0].id;

      const plugin = getPlugin(payload.requestType);
      if (plugin) {
        await plugin.upsert(client, requestId, payload);
      }

      await client.query("COMMIT");

      const fullRequest = await requestRepository.findById(requestId);
      if (!fullRequest) {
        throw new Error("Failed to retrieve created request");
      }
      return fullRequest;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async update(id: string, payload: RequestPayload) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updateRes = await client.query(
        `UPDATE service_requests
         SET
           title           = $2,
           request_type_id = (SELECT id FROM request_types WHERE name = $3),
           requester_name  = $4,
           requester_email = $5,
           detail          = $6,
           updated_at      = now()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id`,
        [
          id,
          payload.title,
          payload.requestType,
          payload.requesterName,
          payload.requesterEmail,
          payload.detail
        ]
      );

      if (updateRes.rowCount === 0) {
        throw new HttpError(404, "ไม่พบ Request ที่ต้องการแก้ไข");
      }

      // Keep the sub-table for the selected type, drop the others.
      for (const plugin of plugins) {
        if (plugin.type === payload.requestType) {
          await plugin.upsert(client, id, payload);
        } else {
          await plugin.deleteFor(client, id);
        }
      }

      await client.query("COMMIT");

      const fullRequest = await requestRepository.findById(id);
      if (!fullRequest) {
        throw new HttpError(404, "ไม่พบ Request ที่ต้องการแก้ไข");
      }
      return fullRequest;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async updateStatus(id: string, status: RequestStatus, changedBy?: string) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Read the current status first so we can log the transition.
      const current = await client.query<{ status: RequestStatus }>(
        `SELECT status FROM service_requests
         WHERE id = $1 AND deleted_at IS NULL
         FOR UPDATE`,
        [id]
      );

      if (current.rowCount === 0) {
        throw new HttpError(404, "ไม่พบ Request ที่ต้องการอัปเดตสถานะ");
      }

      const oldStatus = current.rows[0].status;

      await client.query(
        `UPDATE service_requests
         SET status = $2, updated_at = now()
         WHERE id = $1 AND deleted_at IS NULL`,
        [id, status]
      );

      // Record the change only when the status actually changed.
      if (oldStatus !== status) {
        await client.query(
          `INSERT INTO request_status_logs
             (request_id, old_status, new_status, changed_by)
           VALUES ($1, $2, $3, $4)`,
          [id, oldStatus, status, changedBy ?? null]
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    return requestRepository.findById(id);
  },
  
  async reply(id: string, message: string, repliedBy?: string) {
    const result = await pool.query(
      `UPDATE service_requests
       SET admin_reply = $2, admin_reply_at = now(), admin_reply_by = $3, updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id, message, repliedBy ?? null]
    );

    if (result.rowCount === 0) {
      throw new HttpError(404, "ไม่พบ Request ที่ต้องการตอบกลับ");
    }

    return requestRepository.findById(id);
  },

  async softDelete(id: string) {
    const result = await pool.query(
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
