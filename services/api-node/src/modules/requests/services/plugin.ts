import type { PoolClient } from "pg";
import type { ZodRawShape } from "zod";
import type {
  RequestPayload,
  RequestType,
  ServiceRequest
} from "../request.types.js";

/**
 * A self-contained handler for one request type (service).
 *
 * Each service owns its sub-table SQL, row mapping, validation and field
 * shape. The generic repository/validation layer iterates over the registry
 * and delegates the type-specific work to these plugins, so adding a new
 * service means adding one plugin file + registering it — no edits to the
 * generic code or to other services.
 */
export interface RequestTypePlugin {
  /** The request type this plugin handles. */
  type: RequestType;

  /** SQL columns (aliased) to add to the SELECT for list/findById. */
  selectColumns: string;

  /** LEFT JOIN clause that exposes the columns referenced by selectColumns. */
  joinClause: string;

  /** Map a joined DB row to this service's camelCase fields. */
  mapRow(row: Record<string, unknown>): Partial<ServiceRequest>;

  /** Insert-or-update this service's sub-table row (used by create & update). */
  upsert(
    client: PoolClient,
    requestId: string,
    payload: RequestPayload
  ): Promise<void>;

  /** Remove this service's sub-table row (used when type changes on update). */
  deleteFor(client: PoolClient, requestId: string): Promise<void>;

  /** Zod shape for this service's fields, merged into the payload schema. */
  schema: ZodRawShape;
}
