import { Router } from "express";
import { HttpError } from "../../utils/httpError.js";
import { requestService } from "./request.service.js";
import {
  listQuerySchema,
  requestPayloadSchema
} from "./request.validation.js";

export const requestRouter = Router();

requestRouter.get("/", async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await requestService.list(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

requestRouter.get("/:id", async (req, res, next) => {
  try {
    const request = await requestService.findById(req.params.id);

    if (!request) {
      throw new HttpError(404, "ไม่พบ Request");
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
});

requestRouter.post("/", async (req, res, next) => {
  try {
    const payload = requestPayloadSchema.parse(req.body);
    const created = await requestService.create(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

requestRouter.put("/:id", async (req, res, next) => {
  try {
    const payload = requestPayloadSchema.parse(req.body);
    const updated = await requestService.update(req.params.id, payload);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

requestRouter.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await requestService.softDelete(req.params.id);
    res.json(deleted);
  } catch (error) {
    next(error);
  }
});

