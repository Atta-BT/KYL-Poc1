import { apiFetch } from "./client";
import type {
  PagedResponse,
  RequestPayloadForApi,
  RequestStatus,
  RequestType,
  ServiceRequest
} from "../types";

export type ListRequestsOptions = {
  page: number;
  pageSize: number;
  search?: string;
  type?: RequestType;
  status?: RequestStatus;
};

export const listRequests = (options: ListRequestsOptions) => {
  const params = new URLSearchParams({
    page: String(options.page),
    pageSize: String(options.pageSize)
  });

  if (options.search) params.set("search", options.search);
  if (options.type) params.set("type", options.type);
  if (options.status) params.set("status", options.status);

  return apiFetch<PagedResponse<ServiceRequest>>(
    `/requests?${params.toString()}`
  );
};

export const getRequest = (id: string) =>
  apiFetch<ServiceRequest>(`/requests/${id}`);

export const createRequest = (payload: RequestPayloadForApi) =>
  apiFetch<ServiceRequest>("/requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const updateRequest = (id: string, payload: RequestPayloadForApi) =>
  apiFetch<ServiceRequest>(`/requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

export const updateRequestStatus = (id: string, status: RequestStatus) =>
  apiFetch<ServiceRequest>(`/requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });

export const replyToRequest = (id: string, reply: string) =>
  apiFetch<ServiceRequest>(`/requests/${id}/reply`, {
    method: "PATCH",
    body: JSON.stringify({ reply })
  });

export const deleteRequest = (id: string) =>
  apiFetch<ServiceRequest>(`/requests/${id}`, {
    method: "DELETE"
  });

