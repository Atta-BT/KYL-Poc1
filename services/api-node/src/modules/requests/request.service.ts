import { requestRepository } from "./request.repository.js";
import type {
  ListRequestParams,
  PagedResult,
  RequestPayload,
  ServiceRequest
} from "./request.types.js";

export const requestService = {
  async list(
    params: ListRequestParams
  ): Promise<PagedResult<ServiceRequest>> {
    const { data, total } = await requestRepository.list(params);

    return {
      data,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / params.pageSize))
      }
    };
  },

  async findById(id: string) {
    return requestRepository.findById(id);
  },

  async create(payload: RequestPayload) {
    return requestRepository.create(payload);
  },

  async update(id: string, payload: RequestPayload) {
    return requestRepository.update(id, payload);
  },

  async softDelete(id: string) {
    return requestRepository.softDelete(id);
  }
};

