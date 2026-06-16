import type { RequestType } from "../../../types";
import type { ServiceFormModule } from "./types";
import { ithenticateForm } from "./ithenticate";
import { fulltextForm } from "./fulltext";
import { bookDeliveryForm } from "./bookDelivery";
import { interlibraryLoanForm } from "./interlibraryLoan";
import { publishDeliveryForm } from "./publishDelivery";

/**
 * All registered service form modules. Add a new service by creating a module
 * file and listing it here — RequestFormPage picks it up automatically.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modules: ServiceFormModule<any>[] = [
  ithenticateForm,
  fulltextForm,
  bookDeliveryForm,
  interlibraryLoanForm,
  publishDeliveryForm
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const byType = new Map<RequestType, ServiceFormModule<any>>(
  modules.map((module) => [module.type, module])
);

export const getServiceForm = (
  type: RequestType | ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ServiceFormModule<any> | undefined =>
  type ? byType.get(type) : undefined;
