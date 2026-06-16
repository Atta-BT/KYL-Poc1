import { z } from "zod";
import type { RequestTypePlugin } from "./plugin.js";

/** Publish/Dissemination-specific fields (shared by ServiceRequest and RequestPayload). */
export interface PublishDeliveryFields {
  pubStaffStudentId?: string | null;
  pubStatus?: string | null;
  pubFaculty?: string | null;
  pubFacultyOther?: string | null;
  pubTelephone?: string | null;
  pubWorkTitle?: string | null;
  pubWorkType?: string | null;
  pubAuthor?: string | null;
  pubYear?: string | null;
  pubDescription?: string | null;
}

export const publishDeliveryPlugin: RequestTypePlugin = {
  type: "บริการนำส่งเผยแพร่ผลงาน หนังสือ ตำรา",

  selectColumns: `pdr.staff_student_id AS pub_staff_student_id,
              pdr.status AS pub_status,
              pdr.faculty AS pub_faculty,
              pdr.faculty_other AS pub_faculty_other,
              pdr.telephone AS pub_telephone,
              pdr.work_title AS pub_work_title,
              pdr.work_type AS pub_work_type,
              pdr.author AS pub_author,
              pdr.work_year AS pub_year,
              pdr.description AS pub_description`,

  joinClause:
    "LEFT JOIN publish_delivery_requests pdr ON pdr.request_id = sr.id",

  mapRow: (row) => ({
    pubStaffStudentId: row.pub_staff_student_id as string | null,
    pubStatus: row.pub_status as string | null,
    pubFaculty: row.pub_faculty as string | null,
    pubFacultyOther: row.pub_faculty_other as string | null,
    pubTelephone: row.pub_telephone as string | null,
    pubWorkTitle: row.pub_work_title as string | null,
    pubWorkType: row.pub_work_type as string | null,
    pubAuthor: row.pub_author as string | null,
    pubYear: row.pub_year as string | null,
    pubDescription: row.pub_description as string | null
  }),

  async upsert(client, requestId, payload) {
    await client.query(
      `INSERT INTO publish_delivery_requests
         (request_id, staff_student_id, status, faculty, faculty_other, telephone, work_title, work_type, author, work_year, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (request_id) DO UPDATE
       SET
         staff_student_id = EXCLUDED.staff_student_id,
         status           = EXCLUDED.status,
         faculty          = EXCLUDED.faculty,
         faculty_other    = EXCLUDED.faculty_other,
         telephone        = EXCLUDED.telephone,
         work_title       = EXCLUDED.work_title,
         work_type        = EXCLUDED.work_type,
         author           = EXCLUDED.author,
         work_year        = EXCLUDED.work_year,
         description      = EXCLUDED.description`,
      [
        requestId,
        payload.pubStaffStudentId,
        payload.pubStatus,
        payload.pubFaculty,
        payload.pubFacultyOther || null,
        payload.pubTelephone,
        payload.pubWorkTitle,
        payload.pubWorkType,
        payload.pubAuthor,
        payload.pubYear || null,
        payload.pubDescription || null
      ]
    );
  },

  async deleteFor(client, requestId) {
    await client.query(
      `DELETE FROM publish_delivery_requests WHERE request_id = $1`,
      [requestId]
    );
  },

  schema: {
    pubStaffStudentId: z.string().trim().optional().nullable(),
    pubStatus: z.string().trim().optional().nullable(),
    pubFaculty: z.string().trim().optional().nullable(),
    pubFacultyOther: z.string().trim().optional().nullable(),
    pubTelephone: z.string().trim().optional().nullable(),
    pubWorkTitle: z.string().trim().optional().nullable(),
    pubWorkType: z.string().trim().optional().nullable(),
    pubAuthor: z.string().trim().optional().nullable(),
    pubYear: z.string().trim().optional().nullable(),
    pubDescription: z.string().trim().optional().nullable()
  }
};
