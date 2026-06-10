import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { requestRouter } from "./modules/requests/request.routes.js";
import { requestTypes } from "./modules/requests/request.types.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

  app.get("/api/health", async (_req, res, next) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok", database: "connected" });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/request-types", (_req, res) => {
    res.json(requestTypes);
  });

  app.use("/api/auth", authRouter);
  app.use("/api/requests", requestRouter);
  app.use(errorHandler);

  return app;
};

