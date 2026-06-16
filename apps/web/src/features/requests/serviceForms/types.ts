import type { ReactNode } from "react";
import type { RequestPayload, RequestType, ServiceRequest } from "../../../types";

export type ServiceFormErrors = Record<string, string | undefined>;

export interface ServiceFormProps<TValue> {
  value: TValue;
  /** Replace the whole service value. */
  onChange: (value: TValue) => void;
  errors: ServiceFormErrors;
  /** Clear a single field error (mirrors the previous inline behaviour). */
  clearError: (field: string) => void;
}

/**
 * A self-contained form for one request type. Owns its value shape, initial
 * values, validation, payload construction and the form UI. The page treats
 * services uniformly through this interface, so adding a service means adding
 * one module + registering it.
 */
export interface ServiceFormModule<TValue> {
  type: RequestType;
  /** Initial value for a brand-new request. */
  emptyValue: TValue;
  /** Build the value from an existing request (edit mode). */
  fromRequest: (request: ServiceRequest) => TValue;
  /** Service-specific validation; returns field -> error message. */
  validate: (value: TValue) => Record<string, string>;
  /** Build the `detail` string and extra API payload fields on save. */
  buildPayload: (value: TValue) => {
    detail: string;
    extra: Partial<RequestPayload>;
  };
  /** The service-specific form fields. */
  Form: (props: ServiceFormProps<TValue>) => ReactNode;
}
