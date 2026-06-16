import { z } from "zod";
import type { RequestTypePlugin } from "./plugin.js";

/** iThenticate-specific fields (shared by ServiceRequest and RequestPayload). */
export interface IthenticateFields {
  ithenticateStatus?: string | null;
  ithenticateFaculty?: string | null;
  ithenticateFacultyOther?: string | null;
  ithenticateTelephone?: string | null;
  ithenticateFiles?: string[] | null;
  ithenticateExclusionFilters?: string[] | null;
  ithenticateWantAiReport?: string | null;
}

export const ithenticatePlugin: RequestTypePlugin = {
  type: "บริการตรวจการคัดลอกผลงาน (iThenticate)",

  selectColumns: `ir.status AS ithenticate_status,
              ir.faculty AS ithenticate_faculty,
              ir.faculty_other AS ithenticate_faculty_other,
              ir.telephone AS ithenticate_telephone,
              ir.files AS ithenticate_files,
              ir.exclusion_filters AS ithenticate_exclusion_filters,
              ir.want_ai_report AS ithenticate_want_ai_report`,

  joinClause: "LEFT JOIN ithenticate_requests ir ON ir.request_id = sr.id",

  mapRow: (row) => ({
    ithenticateStatus: row.ithenticate_status as string | null,
    ithenticateFaculty: row.ithenticate_faculty as string | null,
    ithenticateFacultyOther: row.ithenticate_faculty_other as string | null,
    ithenticateTelephone: row.ithenticate_telephone as string | null,
    ithenticateFiles: row.ithenticate_files as string[] | null,
    ithenticateExclusionFilters: row.ithenticate_exclusion_filters as
      | string[]
      | null,
    ithenticateWantAiReport: row.ithenticate_want_ai_report as string | null
  }),

  async upsert(client, requestId, payload) {
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
        requestId,
        payload.ithenticateStatus,
        payload.ithenticateFaculty || null,
        payload.ithenticateFacultyOther || null,
        payload.ithenticateTelephone,
        payload.ithenticateFiles || [],
        payload.ithenticateExclusionFilters || [],
        payload.ithenticateWantAiReport
      ]
    );
  },

  async deleteFor(client, requestId) {
    await client.query(
      `DELETE FROM ithenticate_requests WHERE request_id = $1`,
      [requestId]
    );
  },

  schema: {
    ithenticateStatus: z.string().trim().optional().nullable(),
    ithenticateFaculty: z.string().trim().optional().nullable(),
    ithenticateFacultyOther: z.string().trim().optional().nullable(),
    ithenticateTelephone: z.string().trim().optional().nullable(),
    ithenticateFiles: z.array(z.string()).optional().nullable(),
    ithenticateExclusionFilters: z.array(z.string()).optional().nullable(),
    ithenticateWantAiReport: z.string().trim().optional().nullable()
  }
};
