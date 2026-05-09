import { Router } from "express";
import { CreateModelBody, DeployModelParams } from "@workspace/api-zod";

const router = Router();
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000/api/v1";

router.get("/models", async (_req, res): Promise<void> => {
  // Mock data as backend doesn't seem to have a dedicated /models endpoint yet
  res.json({
    items: [
      {
        id: "m-1",
        name: "YOLOv8-Traffic",
        version: "v1.2.0",
        status: "active",
        accuracy: 94.5,
        deviceCount: 156,
        uploadedAt: new Date(Date.now() - 864000000).toISOString(),
        deployedAt: new Date(Date.now() - 800000000).toISOString(),
      },
    ],
    total: 1,
  });
});

router.post("/models", async (req, res): Promise<void> => {
  const body = CreateModelBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  res.status(201).json({
    id: `m-${Date.now()}`,
    name: body.data.name,
    version: body.data.version,
    status: "inactive",
    accuracy: null,
    deviceCount: 0,
    uploadedAt: new Date().toISOString(),
    deployedAt: null,
  });
});

router.post("/models/:id/deploy", async (req, res): Promise<void> => {
  const params = DeployModelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  res.json({
    id: params.data.id,
    name: "YOLOv8-Updated",
    version: "v1.2.1",
    status: "deploying",
    accuracy: 95.0,
    deviceCount: 147,
    uploadedAt: new Date(Date.now() - 100000).toISOString(),
    deployedAt: new Date().toISOString(),
  });
});

export default router;
