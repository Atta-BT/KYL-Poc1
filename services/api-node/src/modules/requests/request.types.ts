import type { BookDeliveryFields } from "./services/book-delivery.js";
import type { FulltextFields } from "./services/fulltext.js";
import type { IthenticateFields } from "./services/ithenticate.js";
import type { InterlibraryLoanFields } from "./services/interlibrary-loan.js";
import type { PublishDeliveryFields } from "./services/publish-delivery.js";

export const requestTypes = [
  "บริการ Find Fulltext 4U",
  "บริการตรวจการคัดลอกผลงาน (iThenticate)",
  "บริการนำส่งหนังสือ (Book Delivery)",
  "บริการยืมระหว่างห้องสมุด",
  "บริการนำส่งเผยแพร่ผลงาน หนังสือ ตำรา"
] as const;

export type RequestType = (typeof requestTypes)[number];

export const requestStatuses = [
  "pending",
  "in_progress",
  "resolved",
  "rejected"
] as const;

export type RequestStatus = (typeof requestStatuses)[number];

/** Fields owned by the base service_requests row. */
type BaseRequest = {
  id: string;
  requestNo: string;
  title: string;
  requestType: RequestType;
  requesterName: string;
  requesterEmail: string;
  detail: string;
  status: RequestStatus;
  adminReply: string | null;
  adminReplyAt: string | null;
  adminReplyBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

/** Base fields supplied when creating/updating a request. */
type BasePayload = {
  title: string;
  requestType: RequestType;
  requesterName: string;
  requesterEmail: string;
  detail: string;
};

/** Per-service field groups are owned by their plugin files. */
type ServiceFields = IthenticateFields &
  FulltextFields &
  BookDeliveryFields &
  InterlibraryLoanFields &
  PublishDeliveryFields;

export type ServiceRequest = BaseRequest & ServiceFields;

export type RequestPayload = BasePayload & ServiceFields;

export type ListRequestParams = {
  page: number;
  pageSize: number;
  search?: string;
  type?: RequestType;
  status?: RequestStatus;
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
