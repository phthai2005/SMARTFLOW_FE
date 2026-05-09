import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000/api/v1";

router.get("/healthz", async (_req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      const data = HealthCheckResponse.parse({ status: "ok" });
      res.json(data);
    } else {
      res.status(502).json({ error: "Backend health check failed" });
    }
  } catch (error) {
    res.status(502).json({ error: "Cannot reach backend" });
  }
});

export default router;
