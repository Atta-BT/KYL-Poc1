export const requestTypes = [
  "บริการ Find Fulltext 4U",
  "บริการตรวจการคัดลอกผลงาน (iThenticate)",
  "บริการนำส่งหนังสือ (Book Delivery)"
] as const;

export type RequestType = (typeof requestTypes)[number];

export type ServiceRequest = {
  id: string;
  requestNo: string;
  title: string;
  requestType: RequestType;
  requesterName: string;
  requesterEmail: string;
  detail: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // iThenticate specific fields
  ithenticateStatus?: string | null;
  ithenticateFaculty?: string | null;
  ithenticateFacultyOther?: string | null;
  ithenticateTelephone?: string | null;
  ithenticateFiles?: string[] | null;
  ithenticateExclusionFilters?: string[] | null;
  ithenticateWantAiReport?: string | null;

  // Find Full-text 4U specific fields
  fulltextStatus?: string | null;
  fulltextFaculty?: string | null;
  fulltextFacultyOther?: string | null;
  fulltextTelephone?: string | null;
  fulltextArticleTitle?: string | null;
  fulltextDoi?: string | null;
  fulltextMoreInfo?: string | null;
  fulltextPurchaseConsent?: string | null;

  // Book Delivery specific fields
  deliveryStaffStudentId?: string | null;
  deliveryStatus?: string | null;
  deliveryFaculty?: string | null;
  deliveryFacultyOther?: string | null;
  deliveryBookTitle?: string | null;
  deliveryLcCall?: string | null;
  deliveryCollection?: string | null;
};

export type RequestPayload = {
  title: string;
  requestType: RequestType;
  requesterName: string;
  requesterEmail: string;
  detail: string;

  // iThenticate specific fields
  ithenticateStatus?: string | null;
  ithenticateFaculty?: string | null;
  ithenticateFacultyOther?: string | null;
  ithenticateTelephone?: string | null;
  ithenticateFiles?: string[] | null;
  ithenticateExclusionFilters?: string[] | null;
  ithenticateWantAiReport?: string | null;

  // Find Full-text 4U specific fields
  fulltextStatus?: string | null;
  fulltextFaculty?: string | null;
  fulltextFacultyOther?: string | null;
  fulltextTelephone?: string | null;
  fulltextArticleTitle?: string | null;
  fulltextDoi?: string | null;
  fulltextMoreInfo?: string | null;
  fulltextPurchaseConsent?: string | null;

  // Book Delivery specific fields
  deliveryStaffStudentId?: string | null;
  deliveryStatus?: string | null;
  deliveryFaculty?: string | null;
  deliveryFacultyOther?: string | null;
  deliveryBookTitle?: string | null;
  deliveryLcCall?: string | null;
  deliveryCollection?: string | null;
};

export type ListRequestParams = {
  page: number;
  pageSize: number;
  search?: string;
  type?: RequestType;
};

export type PagedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

