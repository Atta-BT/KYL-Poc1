export const REQUEST_TYPES = [
  "บริการ Find Fulltext 4U",
  "บริการตรวจการคัดลอกผลงาน (iThenticate)",
  "บริการนำส่งหนังสือ (Book Delivery)",
  "บริการยืมระหว่างห้องสมุด",
  "บริการนำส่งเผยแพร่ผลงาน หนังสือ ตำรา"
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];

export const REQUEST_STATUSES = [
  "pending",
  "in_progress",
  "resolved",
  "rejected"
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Display label + chip colours for each status. */
export const REQUEST_STATUS_META: Record<
  RequestStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  pending: {
    label: "รอดำเนินการ",
    bg: "#fef3c7",
    color: "#92400e",
    border: "#fcd34d"
  },
  in_progress: {
    label: "อยู่ระหว่างดำเนินการ",
    bg: "#dbeafe",
    color: "#1e40af",
    border: "#93c5fd"
  },
  resolved: {
    label: "ดำเนินการแล้ว",
    bg: "#dcfce7",
    color: "#166534",
    border: "#86efac"
  },
  rejected: {
    label: "ถูกปฏิเสธ",
    bg: "#fee2e2",
    color: "#991b1b",
    border: "#fca5a5"
  }
};

export type ServiceRequest = {
  id: string;
  requestNo: string;
  title: string;
  requestType: RequestType;
  requesterName: string;
  requesterEmail: string;
  detail: string;
  status: RequestStatus;
  adminReply?: string | null;
  adminReplyAt?: string | null;
  adminReplyBy?: string | null;
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

  // Interlibrary Loan specific fields
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

  // Publish/Dissemination specific fields
  pubStaffStudentId?: string | null;
  pubStatus?: string | null;
  pubFaculty?: string | null;
  pubFacultyOther?: string | null;
  pubTelephone?: string | null;
  pubWorkTitle?: string | null;
  pubWorkType?: string | null;
  pubAuthor?: string | null;
  pubYear?: string | null;
  pubDescription?: string | null;
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
  },
  "บริการยืมระหว่างห้องสมุด": {
    bg: "#ede9fe",
    color: "#5b21b6",
    border: "#c4b5fd"
  },
  "บริการนำส่งเผยแพร่ผลงาน หนังสือ ตำรา": {
    bg: "#ffe4e6",
    color: "#9f1239",
    border: "#fda4af"
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

  // Interlibrary Loan specific fields
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

  // Publish/Dissemination specific fields
  pubStaffStudentId?: string | null;
  pubStatus?: string | null;
  pubFaculty?: string | null;
  pubFacultyOther?: string | null;
  pubTelephone?: string | null;
  pubWorkTitle?: string | null;
  pubWorkType?: string | null;
  pubAuthor?: string | null;
  pubYear?: string | null;
  pubDescription?: string | null;
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

