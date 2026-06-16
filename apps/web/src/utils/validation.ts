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
    detail: payload.detail.trim(),

    ithenticateStatus: payload.ithenticateStatus,
    ithenticateFaculty: payload.ithenticateFaculty,
    ithenticateFacultyOther: payload.ithenticateFacultyOther,
    ithenticateTelephone: payload.ithenticateTelephone,
    ithenticateFiles: payload.ithenticateFiles,
    ithenticateExclusionFilters: payload.ithenticateExclusionFilters,
    ithenticateWantAiReport: payload.ithenticateWantAiReport,

    fulltextStatus: payload.fulltextStatus,
    fulltextFaculty: payload.fulltextFaculty,
    fulltextFacultyOther: payload.fulltextFacultyOther,
    fulltextTelephone: payload.fulltextTelephone,
    fulltextArticleTitle: payload.fulltextArticleTitle,
    fulltextDoi: payload.fulltextDoi,
    fulltextMoreInfo: payload.fulltextMoreInfo,
    fulltextPurchaseConsent: payload.fulltextPurchaseConsent,

    deliveryStaffStudentId: payload.deliveryStaffStudentId,
    deliveryStatus: payload.deliveryStatus,
    deliveryFaculty: payload.deliveryFaculty,
    deliveryFacultyOther: payload.deliveryFacultyOther,
    deliveryBookTitle: payload.deliveryBookTitle,
    deliveryLcCall: payload.deliveryLcCall,
    deliveryCollection: payload.deliveryCollection,

    illStaffStudentId: payload.illStaffStudentId,
    illStatus: payload.illStatus,
    illFaculty: payload.illFaculty,
    illFacultyOther: payload.illFacultyOther,
    illTelephone: payload.illTelephone,
    illResourceTitle: payload.illResourceTitle,
    illAuthor: payload.illAuthor,
    illItemType: payload.illItemType,
    illSourceLibrary: payload.illSourceLibrary,
    illNeedByDate: payload.illNeedByDate,

    pubStaffStudentId: payload.pubStaffStudentId,
    pubStatus: payload.pubStatus,
    pubFaculty: payload.pubFaculty,
    pubFacultyOther: payload.pubFacultyOther,
    pubTelephone: payload.pubTelephone,
    pubWorkTitle: payload.pubWorkTitle,
    pubWorkType: payload.pubWorkType,
    pubAuthor: payload.pubAuthor,
    pubYear: payload.pubYear,
    pubDescription: payload.pubDescription
  };
};

