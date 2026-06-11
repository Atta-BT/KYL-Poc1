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

  // Joined ithenticate fields
  ithenticate_status?: string | null;
  ithenticate_faculty?: string | null;
  ithenticate_faculty_other?: string | null;
  ithenticate_telephone?: string | null;
  ithenticate_files?: string[] | null;
  ithenticate_exclusion_filters?: string[] | null;
  ithenticate_want_ai_report?: string | null;

  // Joined fulltext fields
  fulltext_status?: string | null;
  fulltext_faculty?: string | null;
  fulltext_telephone?: string | null;
  fulltext_article_title?: string | null;
  fulltext_doi?: string | null;
  fulltext_more_info?: string | null;
  fulltext_purchase_consent?: string | null;

  // Joined book delivery fields
  delivery_staff_student_id?: string | null;
  delivery_status?: string | null;
  delivery_faculty?: string | null;
  delivery_book_title?: string | null;
  delivery_lc_call?: string | null;
  delivery_collection?: string | null;
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
  deletedAt: row.deleted_at ? row.deleted_at.toISOString() : null,

  ithenticateStatus: row.ithenticate_status,
  ithenticateFaculty: row.ithenticate_faculty,
  ithenticateFacultyOther: row.ithenticate_faculty_other,
  ithenticateTelephone: row.ithenticate_telephone,
  ithenticateFiles: row.ithenticate_files,
  ithenticateExclusionFilters: row.ithenticate_exclusion_filters,
  ithenticateWantAiReport: row.ithenticate_want_ai_report,

  fulltextStatus: row.fulltext_status,
  fulltextFaculty: row.fulltext_faculty,
  fulltextTelephone: row.fulltext_telephone,
  fulltextArticleTitle: row.fulltext_article_title,
  fulltextDoi: row.fulltext_doi,
  fulltextMoreInfo: row.fulltext_more_info,
  fulltextPurchaseConsent: row.fulltext_purchase_consent,

  deliveryStaffStudentId: row.delivery_staff_student_id,
  deliveryStatus: row.delivery_status,
  deliveryFaculty: row.delivery_faculty,
  deliveryBookTitle: row.delivery_book_title,
  deliveryLcCall: row.delivery_lc_call,
  deliveryCollection: row.delivery_collection
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

  if (userContext && (userContext.role === "student" || userContext.role === "staff")) {
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
      `SELECT sr.*, rt.name AS request_type_name,
              ir.status AS ithenticate_status,
              ir.faculty AS ithenticate_faculty,
              ir.faculty_other AS ithenticate_faculty_other,
              ir.telephone AS ithenticate_telephone,
              ir.files AS ithenticate_files,
              ir.exclusion_filters AS ithenticate_exclusion_filters,
              ir.want_ai_report AS ithenticate_want_ai_report,
              fr.status AS fulltext_status,
              fr.faculty AS fulltext_faculty,
              fr.telephone AS fulltext_telephone,
              fr.article_title AS fulltext_article_title,
              fr.doi AS fulltext_doi,
              fr.more_info AS fulltext_more_info,
              fr.purchase_consent AS fulltext_purchase_consent,
              bdr.staff_student_id AS delivery_staff_student_id,
              bdr.status AS delivery_status,
              bdr.faculty AS delivery_faculty,
              bdr.book_title AS delivery_book_title,
              bdr.lc_call AS delivery_lc_call,
              bdr.collection AS delivery_collection
       FROM service_requests sr
       JOIN request_types rt ON rt.id = sr.request_type_id
       LEFT JOIN ithenticate_requests ir ON ir.request_id = sr.id
       LEFT JOIN fulltext_requests fr ON fr.request_id = sr.id
       LEFT JOIN book_delivery_requests bdr ON bdr.request_id = sr.id
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
      `SELECT sr.*, rt.name AS request_type_name,
              ir.status AS ithenticate_status,
              ir.faculty AS ithenticate_faculty,
              ir.faculty_other AS ithenticate_faculty_other,
              ir.telephone AS ithenticate_telephone,
              ir.files AS ithenticate_files,
              ir.exclusion_filters AS ithenticate_exclusion_filters,
              ir.want_ai_report AS ithenticate_want_ai_report,
              fr.status AS fulltext_status,
              fr.faculty AS fulltext_faculty,
              fr.telephone AS fulltext_telephone,
              fr.article_title AS fulltext_article_title,
              fr.doi AS fulltext_doi,
              fr.more_info AS fulltext_more_info,
              fr.purchase_consent AS fulltext_purchase_consent,
              bdr.staff_student_id AS delivery_staff_student_id,
              bdr.status AS delivery_status,
              bdr.faculty AS delivery_faculty,
              bdr.book_title AS delivery_book_title,
              bdr.lc_call AS delivery_lc_call,
              bdr.collection AS delivery_collection
       FROM service_requests sr
       JOIN request_types rt ON rt.id = sr.request_type_id
       LEFT JOIN ithenticate_requests ir ON ir.request_id = sr.id
       LEFT JOIN fulltext_requests fr ON fr.request_id = sr.id
       LEFT JOIN book_delivery_requests bdr ON bdr.request_id = sr.id
       WHERE sr.id = $1 AND sr.deleted_at IS NULL`,
      [id]
    );

    return result.rows[0] ? toRequest(result.rows[0]) : null;
  },

  async create(payload: RequestPayload) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertRequestRes = await client.query<RequestRow>(
        `INSERT INTO service_requests
           (title, request_type_id, requester_name, requester_email, detail)
         VALUES (
           $1,
           (SELECT id FROM request_types WHERE name = $2),
           $3, $4, $5
         )
         RETURNING *`,
        [
          payload.title,
          payload.requestType,
          payload.requesterName,
          payload.requesterEmail,
          payload.detail
        ]
      );
      const row = insertRequestRes.rows[0];

      if (payload.requestType === "บริการตรวจการคัดลอกผลงาน (iThenticate)") {
        await client.query(
          `INSERT INTO ithenticate_requests
             (request_id, status, faculty, faculty_other, telephone, files, exclusion_filters, want_ai_report)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            row.id,
            payload.ithenticateStatus,
            payload.ithenticateFaculty || null,
            payload.ithenticateFacultyOther || null,
            payload.ithenticateTelephone,
            payload.ithenticateFiles || [],
            payload.ithenticateExclusionFilters || [],
            payload.ithenticateWantAiReport
          ]
        );
      } else if (payload.requestType === "บริการ Find Fulltext 4U") {
        await client.query(
          `INSERT INTO fulltext_requests
             (request_id, status, faculty, telephone, article_title, doi, more_info, purchase_consent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            row.id,
            payload.fulltextStatus,
            payload.fulltextFaculty,
            payload.fulltextTelephone || null,
            payload.fulltextArticleTitle,
            payload.fulltextDoi,
            payload.fulltextMoreInfo || null,
            payload.fulltextPurchaseConsent
          ]
        );
      } else if (payload.requestType === "บริการนำส่งหนังสือ (Book Delivery)") {
        await client.query(
          `INSERT INTO book_delivery_requests
             (request_id, staff_student_id, status, faculty, book_title, lc_call, collection)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            row.id,
            payload.deliveryStaffStudentId,
            payload.deliveryStatus,
            payload.deliveryFaculty,
            payload.deliveryBookTitle,
            payload.deliveryLcCall,
            payload.deliveryCollection
          ]
        );
      }

      await client.query("COMMIT");

      const fullRequest = await requestRepository.findById(row.id);
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

      const updateRes = await client.query<RequestRow>(
        `UPDATE service_requests
         SET
           title           = $2,
           request_type_id = (SELECT id FROM request_types WHERE name = $3),
           requester_name  = $4,
           requester_email = $5,
           detail          = $6,
           updated_at      = now()
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

      if (updateRes.rowCount === 0) {
        throw new HttpError(404, "ไม่พบ Request ที่ต้องการแก้ไข");
      }

      if (payload.requestType === "บริการตรวจการคัดลอกผลงาน (iThenticate)") {
        await client.query(
          `INSERT INTO ithenticate_requests
             (request_id, status, faculty, faculty_other, telephone, files, exclusion_filters, want_ai_report)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (request_id) DO UPDATE
           SET
             status            = EXCLUDED.status,
             faculty           = EXCLUDED.faculty,
             faculty_other     = EXCLUDED.faculty_other,
             telephone         = EXCLUDED.telephone,
             files             = EXCLUDED.files,
             exclusion_filters = EXCLUDED.exclusion_filters,
             want_ai_report    = EXCLUDED.want_ai_report`,
          [
            id,
            payload.ithenticateStatus,
            payload.ithenticateFaculty || null,
            payload.ithenticateFacultyOther || null,
            payload.ithenticateTelephone,
            payload.ithenticateFiles || [],
            payload.ithenticateExclusionFilters || [],
            payload.ithenticateWantAiReport
          ]
        );
        // Delete from other tables
        await client.query(
          `DELETE FROM fulltext_requests WHERE request_id = $1`,
          [id]
        );
        await client.query(
          `DELETE FROM book_delivery_requests WHERE request_id = $1`,
          [id]
        );
      } else if (payload.requestType === "บริการ Find Fulltext 4U") {
        await client.query(
          `INSERT INTO fulltext_requests
             (request_id, status, faculty, telephone, article_title, doi, more_info, purchase_consent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (request_id) DO UPDATE
           SET
             status           = EXCLUDED.status,
             faculty          = EXCLUDED.faculty,
             telephone        = EXCLUDED.telephone,
             article_title    = EXCLUDED.article_title,
             doi              = EXCLUDED.doi,
             more_info        = EXCLUDED.more_info,
             purchase_consent = EXCLUDED.purchase_consent`,
          [
            id,
            payload.fulltextStatus,
            payload.fulltextFaculty,
            payload.fulltextTelephone || null,
            payload.fulltextArticleTitle,
            payload.fulltextDoi,
            payload.fulltextMoreInfo || null,
            payload.fulltextPurchaseConsent
          ]
        );
        // Delete from other tables
        await client.query(
          `DELETE FROM ithenticate_requests WHERE request_id = $1`,
          [id]
        );
        await client.query(
          `DELETE FROM book_delivery_requests WHERE request_id = $1`,
          [id]
        );
      } else if (payload.requestType === "บริการนำส่งหนังสือ (Book Delivery)") {
        await client.query(
          `INSERT INTO book_delivery_requests
             (request_id, staff_student_id, status, faculty, book_title, lc_call, collection)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (request_id) DO UPDATE
           SET
             staff_student_id = EXCLUDED.staff_student_id,
             status           = EXCLUDED.status,
             faculty          = EXCLUDED.faculty,
             book_title       = EXCLUDED.book_title,
             lc_call          = EXCLUDED.lc_call,
             collection       = EXCLUDED.collection`,
          [
            id,
            payload.deliveryStaffStudentId,
            payload.deliveryStatus,
            payload.deliveryFaculty,
            payload.deliveryBookTitle,
            payload.deliveryLcCall,
            payload.deliveryCollection
          ]
        );
        // Delete from other tables
        await client.query(
          `DELETE FROM ithenticate_requests WHERE request_id = $1`,
          [id]
        );
        await client.query(
          `DELETE FROM fulltext_requests WHERE request_id = $1`,
          [id]
        );
      } else {
        // Delete from all tables if not matching either type
        await client.query(
          `DELETE FROM ithenticate_requests WHERE request_id = $1`,
          [id]
        );
        await client.query(
          `DELETE FROM fulltext_requests WHERE request_id = $1`,
          [id]
        );
        await client.query(
          `DELETE FROM book_delivery_requests WHERE request_id = $1`,
          [id]
        );
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

