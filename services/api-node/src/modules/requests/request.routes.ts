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
    const userRole = req.headers["x-user-role"] as string | undefined;
    const userEmail = req.headers["x-user-email"] as string | undefined;

    const userContext = userRole && userEmail ? { role: userRole, email: userEmail } : undefined;
    const result = await requestService.list(query, userContext);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

requestRouter.get("/:id", async (req, res, next) => {
  try {
    const userRole = req.headers["x-user-role"] as string | undefined;
    const userEmail = req.headers["x-user-email"] as string | undefined;

    const request = await requestService.findById(req.params.id);

    if (!request) {
      throw new HttpError(404, "ไม่พบ Request");
    }

    if (userRole && (userRole === "student" || userRole === "user")) {
      if (request.requesterEmail !== userEmail) {
        throw new HttpError(403, "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
      }
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
    const userRole = req.headers["x-user-role"] as string | undefined;
    const userEmail = req.headers["x-user-email"] as string | undefined;

    const request = await requestService.findById(req.params.id);

    if (!request) {
      throw new HttpError(404, "ไม่พบ Request");
    }

    if (userRole && (userRole === "student" || userRole === "user")) {
      if (request.requesterEmail !== userEmail) {
        throw new HttpError(403, "ไม่มีสิทธิ์แก้ไขข้อมูลนี้");
      }
    }

    const payload = requestPayloadSchema.parse(req.body);
    const updated = await requestService.update(req.params.id, payload);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

requestRouter.delete("/:id", async (req, res, next) => {
  try {
    const userRole = req.headers["x-user-role"] as string | undefined;
    const userEmail = req.headers["x-user-email"] as string | undefined;

    const request = await requestService.findById(req.params.id);

    if (!request) {
      throw new HttpError(404, "ไม่พบ Request");
    }

    if (userRole && (userRole === "student" || userRole === "user")) {
      if (request.requesterEmail !== userEmail) {
        throw new HttpError(403, "ไม่มีสิทธิ์ลบข้อมูลนี้");
      }
    }

    const deleted = await requestService.softDelete(req.params.id);
    res.json(deleted);
  } catch (error) {
    next(error);
  }
});

