import { Router } from "express";
import { eq, count } from "drizzle-orm";
import { db, modelsTable } from "@workspace/db";
import { CreateModelBody, DeployModelParams } from "@workspace/api-zod";

const router = Router();

router.get("/models", async (_req, res): Promise<void> => {
  const items = await db.select().from(modelsTable);
  const totalResult = await db.select({ count: count() }).from(modelsTable);
  res.json({
    items: items.map((m) => ({
      ...m,
      uploadedAt: m.uploadedAt.toISOString(),
      deployedAt: m.deployedAt?.toISOString() ?? null,
    })),
    total: Number(totalResult[0]?.count ?? 0),
  });
});

router.post("/models", async (req, res): Promise<void> => {
  const body = CreateModelBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [model] = await db.insert(modelsTable).values(body.data).returning();
  res.status(201).json({
    ...model,
    uploadedAt: model!.uploadedAt.toISOString(),
    deployedAt: model!.deployedAt?.toISOString() ?? null,
  });
});

router.post("/models/:id/deploy", async (req, res): Promise<void> => {
  const params = DeployModelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [model] = await db
    .update(modelsTable)
    .set({ status: "deploying", deployedAt: new Date(), deviceCount: 147 })
    .where(eq(modelsTable.id, params.data.id))
    .returning();
  if (!model) {
    res.status(404).json({ error: "Model not found" });
    return;
  }
  res.json({
    ...model,
    uploadedAt: model.uploadedAt.toISOString(),
    deployedAt: model.deployedAt?.toISOString() ?? null,
  });
});

export default router;
