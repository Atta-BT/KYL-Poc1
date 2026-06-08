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
  detail: z.string().trim().min(1, "กรุณากรอกรายละเอียด Request")
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().catch(undefined),
  type: z.enum(requestTypes).optional().catch(undefined)
});

