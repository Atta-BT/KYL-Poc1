import { z } from "zod";
import type { RequestTypePlugin } from "./plugin.js";

/** Interlibrary Loan-specific fields (shared by ServiceRequest and RequestPayload). */
export interface InterlibraryLoanFields {
  illStaffStudentId?: string | null;
  illStatus?: string | null;
  illFaculty?: string | null;
  illFacultyOther?: string | null;
  illTelephone?: string | null;
  illResourceTitle?: string | null;
  illAuthor?: string | null;
  illItemType?: string | null;
  illSourceLibrary?: string | null;
  illNeedByDate?: string | null;
}

export const interlibraryLoanPlugin: RequestTypePlugin = {
  type: "บริการยืมระหว่างห้องสมุด",

  selectColumns: `ilr.staff_student_id AS ill_staff_student_id,
              ilr.status AS ill_status,
              ilr.faculty AS ill_faculty,
              ilr.faculty_other AS ill_faculty_other,
              ilr.telephone AS ill_telephone,
              ilr.resource_title AS ill_resource_title,
              ilr.author AS ill_author,
              ilr.item_type AS ill_item_type,
              ilr.source_library AS ill_source_library,
              ilr.need_by_date AS ill_need_by_date`,

  joinClause:
    "LEFT JOIN interlibrary_loan_requests ilr ON ilr.request_id = sr.id",

  mapRow: (row) => ({
    illStaffStudentId: row.ill_staff_student_id as string | null,
    illStatus: row.ill_status as string | null,
    illFaculty: row.ill_faculty as string | null,
    illFacultyOther: row.ill_faculty_other as string | null,
    illTelephone: row.ill_telephone as string | null,
    illResourceTitle: row.ill_resource_title as string | null,
    illAuthor: row.ill_author as string | null,
    illItemType: row.ill_item_type as string | null,
    illSourceLibrary: row.ill_source_library as string | null,
    illNeedByDate: row.ill_need_by_date
      ? (row.ill_need_by_date instanceof Date
          ? row.ill_need_by_date.toISOString().slice(0, 10)
          : String(row.ill_need_by_date))
      : null
  }),

  async upsert(client, requestId, payload) {
    await client.query(
      `INSERT INTO interlibrary_loan_requests
         (request_id, staff_student_id, status, faculty, faculty_other, telephone, resource_title, author, item_type, source_library, need_by_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (request_id) DO UPDATE
       SET
         staff_student_id = EXCLUDED.staff_student_id,
         status           = EXCLUDED.status,
         faculty          = EXCLUDED.faculty,
         faculty_other    = EXCLUDED.faculty_other,
         telephone        = EXCLUDED.telephone,
         resource_title   = EXCLUDED.resource_title,
         author           = EXCLUDED.author,
         item_type        = EXCLUDED.item_type,
         source_library   = EXCLUDED.source_library,
         need_by_date     = EXCLUDED.need_by_date`,
      [
        requestId,
        payload.illStaffStudentId,
        payload.illStatus,
        payload.illFaculty,
        payload.illFacultyOther || null,
        payload.illTelephone,
        payload.illResourceTitle,
        payload.illAuthor || null,
        payload.illItemType,
        payload.illSourceLibrary || null,
        payload.illNeedByDate || null
      ]
    );
  },

  async deleteFor(client, requestId) {
    await client.query(
      `DELETE FROM interlibrary_loan_requests WHERE request_id = $1`,
      [requestId]
    );
  },

  schema: {
    illStaffStudentId: z.string().trim().optional().nullable(),
    illStatus: z.string().trim().optional().nullable(),
    illFaculty: z.string().trim().optional().nullable(),
    illFacultyOther: z.string().trim().optional().nullable(),
    illTelephone: z.string().trim().optional().nullable(),
    illResourceTitle: z.string().trim().optional().nullable(),
    illAuthor: z.string().trim().optional().nullable(),
    illItemType: z.string().trim().optional().nullable(),
    illSourceLibrary: z.string().trim().optional().nullable(),
    illNeedByDate: z.string().trim().optional().nullable()
  }
};
