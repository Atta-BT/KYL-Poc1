import { apiFetch } from "./client";
import type {
  PagedResponse,
  RequestPayloadForApi,
  RequestType,
  ServiceRequest
} from "../types";

export type ListRequestsOptions = {
  page: number;
  pageSize: number;
  search?: string;
  type?: RequestType;
};

export const listRequests = (options: ListRequestsOptions) => {
  const params = new URLSearchParams({
    page: String(options.page),
    pageSize: String(options.pageSize)
  });

  if (options.search) params.set("search", options.search);
  if (options.type) params.set("type", options.type);

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

export const deleteRequest = (id: string) =>
  apiFetch<ServiceRequest>(`/requests/${id}`, {
    method: "DELETE"
  });

