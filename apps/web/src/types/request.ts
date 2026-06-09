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

