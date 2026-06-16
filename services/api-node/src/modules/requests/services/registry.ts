import type { RequestType } from "../request.types.js";
import type { RequestTypePlugin } from "./plugin.js";
import { ithenticatePlugin } from "./ithenticate.js";
import { fulltextPlugin } from "./fulltext.js";
import { bookDeliveryPlugin } from "./book-delivery.js";
import { interlibraryLoanPlugin } from "./interlibrary-loan.js";
import { publishDeliveryPlugin } from "./publish-delivery.js";

/**
 * All registered request-type plugins. To add a new service, create a plugin
 * file and add it to this array — the generic repository and validation pick
 * it up automatically.
 */
export const plugins: RequestTypePlugin[] = [
  ithenticatePlugin,
  fulltextPlugin,
  bookDeliveryPlugin,
  interlibraryLoanPlugin,
  publishDeliveryPlugin
];

const pluginByType = new Map<RequestType, RequestTypePlugin>(
  plugins.map((plugin) => [plugin.type, plugin])
);

export const getPlugin = (type: RequestType): RequestTypePlugin | undefined =>
  pluginByType.get(type);
