import { z } from "zod";
import type { RequestTypePlugin } from "./plugin.js";

/** Find Fulltext 4U-specific fields (shared by ServiceRequest and RequestPayload). */
export interface FulltextFields {
  fulltextStatus?: string | null;
  fulltextFaculty?: string | null;
  fulltextFacultyOther?: string | null;
  fulltextTelephone?: string | null;
  fulltextArticleTitle?: string | null;
  fulltextDoi?: string | null;
  fulltextMoreInfo?: string | null;
  fulltextPurchaseConsent?: string | null;
}

export const fulltextPlugin: RequestTypePlugin = {
  type: "บริการ Find Fulltext 4U",

  selectColumns: `fr.status AS fulltext_status,
              fr.faculty AS fulltext_faculty,
              fr.faculty_other AS fulltext_faculty_other,
              fr.telephone AS fulltext_telephone,
              fr.article_title AS fulltext_article_title,
              fr.doi AS fulltext_doi,
              fr.more_info AS fulltext_more_info,
              fr.purchase_consent AS fulltext_purchase_consent`,

  joinClause: "LEFT JOIN fulltext_requests fr ON fr.request_id = sr.id",

  mapRow: (row) => ({
    fulltextStatus: row.fulltext_status as string | null,
    fulltextFaculty: row.fulltext_faculty as string | null,
    fulltextFacultyOther: row.fulltext_faculty_other as string | null,
    fulltextTelephone: row.fulltext_telephone as string | null,
    fulltextArticleTitle: row.fulltext_article_title as string | null,
    fulltextDoi: row.fulltext_doi as string | null,
    fulltextMoreInfo: row.fulltext_more_info as string | null,
    fulltextPurchaseConsent: row.fulltext_purchase_consent as string | null
  }),

  async upsert(client, requestId, payload) {
    await client.query(
      `INSERT INTO fulltext_requests
         (request_id, status, faculty, faculty_other, telephone, article_title, doi, more_info, purchase_consent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (request_id) DO UPDATE
       SET
         status           = EXCLUDED.status,
         faculty          = EXCLUDED.faculty,
         faculty_other    = EXCLUDED.faculty_other,
         telephone        = EXCLUDED.telephone,
         article_title    = EXCLUDED.article_title,
         doi              = EXCLUDED.doi,
         more_info        = EXCLUDED.more_info,
         purchase_consent = EXCLUDED.purchase_consent`,
      [
        requestId,
        payload.fulltextStatus,
        payload.fulltextFaculty,
        payload.fulltextFacultyOther || null,
        payload.fulltextTelephone || null,
        payload.fulltextArticleTitle,
        payload.fulltextDoi,
        payload.fulltextMoreInfo || null,
        payload.fulltextPurchaseConsent
      ]
    );
  },

  async deleteFor(client, requestId) {
    await client.query(`DELETE FROM fulltext_requests WHERE request_id = $1`, [
      requestId
    ]);
  },

  schema: {
    fulltextStatus: z.string().trim().optional().nullable(),
    fulltextFaculty: z.string().trim().optional().nullable(),
    fulltextFacultyOther: z.string().trim().optional().nullable(),
    fulltextTelephone: z.string().trim().optional().nullable(),
    fulltextArticleTitle: z.string().trim().optional().nullable(),
    fulltextDoi: z.string().trim().optional().nullable(),
    fulltextMoreInfo: z.string().trim().optional().nullable(),
    fulltextPurchaseConsent: z.string().trim().optional().nullable()
  }
};
