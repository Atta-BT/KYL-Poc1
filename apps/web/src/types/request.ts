export const REQUEST_TYPES = [
  "บริการ Find Fulltext 4U",
  "บริการตรวจการคัดลอกผลงาน (iThenticate)",
  "บริการนำส่งหนังสือ (Book Delivery)"
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];

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
  fulltextTelephone?: string | null;
  fulltextArticleTitle?: string | null;
  fulltextDoi?: string | null;
  fulltextMoreInfo?: string | null;
  fulltextPurchaseConsent?: string | null;

  // Book Delivery specific fields
  deliveryStaffStudentId?: string | null;
  deliveryStatus?: string | null;
  deliveryFaculty?: string | null;
  deliveryBookTitle?: string | null;
  deliveryLcCall?: string | null;
  deliveryCollection?: string | null;
};

export const REQUEST_TYPE_COLORS: Record<
  RequestType,
  { bg: string; color: string; border: string }
> = {
  "บริการ Find Fulltext 4U": {
    bg: "#dbeafe",
    color: "#1e40af",
    border: "#93c5fd"
  },
  "บริการตรวจการคัดลอกผลงาน (iThenticate)": {
    bg: "#fef3c7",
    color: "#92400e",
    border: "#fcd34d"
  },
  "บริการนำส่งหนังสือ (Book Delivery)": {
    bg: "#dcfce7",
    color: "#166534",
    border: "#86efac"
  }
};

export type RequestPayload = {
  title: string;
  requestType: RequestType | "";
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
  fulltextTelephone?: string | null;
  fulltextArticleTitle?: string | null;
  fulltextDoi?: string | null;
  fulltextMoreInfo?: string | null;
  fulltextPurchaseConsent?: string | null;

  // Book Delivery specific fields
  deliveryStaffStudentId?: string | null;
  deliveryStatus?: string | null;
  deliveryFaculty?: string | null;
  deliveryBookTitle?: string | null;
  deliveryLcCall?: string | null;
  deliveryCollection?: string | null;
};

export type RequestPayloadForApi = Omit<RequestPayload, "requestType"> & {
  requestType: RequestType;
};

export type PagedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

