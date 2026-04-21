import { Router } from "express";
import { eq, count } from "drizzle-orm";
import { db, adminsTable } from "@workspace/db";
import {
  CreateAdminBody,
  UpdateAdminParams,
  UpdateAdminBody,
  DeleteAdminParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/admins", async (_req, res): Promise<void> => {
  const items = await db.select().from(adminsTable);
  const totalResult = await db.select({ count: count() }).from(adminsTable);
  res.json({
    items: items.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
    total: Number(totalResult[0]?.count ?? 0),
  });
});

router.post("/admins", async (req, res): Promise<void> => {
  const body = CreateAdminBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [admin] = await db.insert(adminsTable).values(body.data).returning();
  res.status(201).json({
    ...admin,
    createdAt: admin!.createdAt.toISOString(),
  });
});

router.patch("/admins/:id", async (req, res): Promise<void> => {
  const params = UpdateAdminParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateAdminBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [admin] = await db
    .update(adminsTable)
    .set(body.data)
    .where(eq(adminsTable.id, params.data.id))
    .returning();
  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }
  res.json({
    ...admin,
    createdAt: admin.createdAt.toISOString(),
  });
});

router.delete("/admins/:id", async (req, res): Promise<void> => {
  const params = DeleteAdminParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [admin] = await db.delete(adminsTable).where(eq(adminsTable.id, params.data.id)).returning();
  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
