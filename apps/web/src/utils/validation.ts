import {
  REQUEST_TYPES,
  type RequestPayload,
  type RequestPayloadForApi,
  type RequestType
} from "../types";

export type FormErrors = Partial<Record<keyof RequestPayload, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRequestPayload = (payload: RequestPayload) => {
  const errors: FormErrors = {};

  if (!payload.title.trim()) errors.title = "กรุณากรอกหัวข้อ Request";
  if (!payload.requestType) errors.requestType = "กรุณาเลือกประเภท Request";
  if (!payload.requesterName.trim()) {
    errors.requesterName = "กรุณากรอกชื่อผู้ส่งคำขอ";
  }
  if (!payload.requesterEmail.trim()) {
    errors.requesterEmail = "กรุณากรอกอีเมล";
  } else if (!emailPattern.test(payload.requesterEmail)) {
    errors.requesterEmail = "รูปแบบอีเมลไม่ถูกต้อง";
  }
  if (!payload.detail.trim()) errors.detail = "กรุณากรอกรายละเอียด Request";

  return errors;
};

export const toApiPayload = (
  payload: RequestPayload
): RequestPayloadForApi => {
  if (!REQUEST_TYPES.includes(payload.requestType as RequestType)) {
    throw new Error("Invalid request type");
  }

  return {
    title: payload.title.trim(),
    requestType: payload.requestType as RequestType,
    requesterName: payload.requesterName.trim(),
    requesterEmail: payload.requesterEmail.trim(),
    detail: payload.detail.trim()
  };
};

