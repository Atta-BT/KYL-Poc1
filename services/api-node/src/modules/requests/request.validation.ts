import { z } from "zod";
import { requestTypes } from "./request.types.js";

export const requestPayloadSchema = z.object({
  title: z.string().trim().min(1, "กรุณากรอกหัวข้อ Request"),
  requestType: z.enum(requestTypes, {
    required_error: "กรุณาเลือกประเภท Request"
  }),
  requesterName: z.string().trim().min(1, "กรุณากรอกชื่อผู้ส่งคำขอ"),
  requesterEmail: z
    .string()
    .trim()
    .email("กรุณากรอกอีเมลให้ถูกต้อง"),
  detail: z.string().trim().min(1, "กรุณากรอกรายละเอียด Request"),
  
  ithenticateStatus: z.string().trim().optional().nullable(),
  ithenticateFaculty: z.string().trim().optional().nullable(),
  ithenticateFacultyOther: z.string().trim().optional().nullable(),
  ithenticateTelephone: z.string().trim().optional().nullable(),
  ithenticateFiles: z.array(z.string()).optional().nullable(),
  ithenticateExclusionFilters: z.array(z.string()).optional().nullable(),
  ithenticateWantAiReport: z.string().trim().optional().nullable(),

  fulltextStatus: z.string().trim().optional().nullable(),
  fulltextFaculty: z.string().trim().optional().nullable(),
  fulltextFacultyOther: z.string().trim().optional().nullable(),
  fulltextTelephone: z.string().trim().optional().nullable(),
  fulltextArticleTitle: z.string().trim().optional().nullable(),
  fulltextDoi: z.string().trim().optional().nullable(),
  fulltextMoreInfo: z.string().trim().optional().nullable(),
  fulltextPurchaseConsent: z.string().trim().optional().nullable(),

  deliveryStaffStudentId: z.string().trim().optional().nullable(),
  deliveryStatus: z.string().trim().optional().nullable(),
  deliveryFaculty: z.string().trim().optional().nullable(),
  deliveryFacultyOther: z.string().trim().optional().nullable(),
  deliveryBookTitle: z.string().trim().optional().nullable(),
  deliveryLcCall: z.string().trim().optional().nullable(),
  deliveryCollection: z.string().trim().optional().nullable()
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().catch(undefined),
  type: z.enum(requestTypes).optional().catch(undefined)
});

