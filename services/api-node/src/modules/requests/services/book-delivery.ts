import { z } from "zod";
import type { RequestTypePlugin } from "./plugin.js";

/** Book Delivery-specific fields (shared by ServiceRequest and RequestPayload). */
export interface BookDeliveryFields {
  deliveryStaffStudentId?: string | null;
  deliveryStatus?: string | null;
  deliveryFaculty?: string | null;
  deliveryFacultyOther?: string | null;
  deliveryBookTitle?: string | null;
  deliveryLcCall?: string | null;
  deliveryCollection?: string | null;
}

export const bookDeliveryPlugin: RequestTypePlugin = {
  type: "บริการนำส่งหนังสือ (Book Delivery)",

  selectColumns: `bdr.staff_student_id AS delivery_staff_student_id,
              bdr.status AS delivery_status,
              bdr.faculty AS delivery_faculty,
              bdr.faculty_other AS delivery_faculty_other,
              bdr.book_title AS delivery_book_title,
              bdr.lc_call AS delivery_lc_call,
              bdr.collection AS delivery_collection`,

  joinClause: "LEFT JOIN book_delivery_requests bdr ON bdr.request_id = sr.id",

  mapRow: (row) => ({
    deliveryStaffStudentId: row.delivery_staff_student_id as string | null,
    deliveryStatus: row.delivery_status as string | null,
    deliveryFaculty: row.delivery_faculty as string | null,
    deliveryFacultyOther: row.delivery_faculty_other as string | null,
    deliveryBookTitle: row.delivery_book_title as string | null,
    deliveryLcCall: row.delivery_lc_call as string | null,
    deliveryCollection: row.delivery_collection as string | null
  }),

  async upsert(client, requestId, payload) {
    await client.query(
      `INSERT INTO book_delivery_requests
         (request_id, staff_student_id, status, faculty, faculty_other, book_title, lc_call, collection)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (request_id) DO UPDATE
       SET
         staff_student_id = EXCLUDED.staff_student_id,
         status           = EXCLUDED.status,
         faculty          = EXCLUDED.faculty,
         faculty_other    = EXCLUDED.faculty_other,
         book_title       = EXCLUDED.book_title,
         lc_call          = EXCLUDED.lc_call,
         collection       = EXCLUDED.collection`,
      [
        requestId,
        payload.deliveryStaffStudentId,
        payload.deliveryStatus,
        payload.deliveryFaculty,
        payload.deliveryFacultyOther || null,
        payload.deliveryBookTitle,
        payload.deliveryLcCall,
        payload.deliveryCollection
      ]
    );
  },

  async deleteFor(client, requestId) {
    await client.query(
      `DELETE FROM book_delivery_requests WHERE request_id = $1`,
      [requestId]
    );
  },

  schema: {
    deliveryStaffStudentId: z.string().trim().optional().nullable(),
    deliveryStatus: z.string().trim().optional().nullable(),
    deliveryFaculty: z.string().trim().optional().nullable(),
    deliveryFacultyOther: z.string().trim().optional().nullable(),
    deliveryBookTitle: z.string().trim().optional().nullable(),
    deliveryLcCall: z.string().trim().optional().nullable(),
    deliveryCollection: z.string().trim().optional().nullable()
  }
};
