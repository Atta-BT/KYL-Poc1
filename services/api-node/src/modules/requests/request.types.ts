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
};

export type RequestPayload = {
  title: string;
  requestType: RequestType;
  requesterName: string;
  requesterEmail: string;
  detail: string;
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

