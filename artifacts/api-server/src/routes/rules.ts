import { Router } from "express";
import { eq, count } from "drizzle-orm";
import { db, rulesTable } from "@workspace/db";
import {
  ListRulesQueryParams,
  CreateRuleBody,
  GetRuleParams,
  UpdateRuleParams,
  UpdateRuleBody,
  DeleteRuleParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/rules", async (req, res): Promise<void> => {
  const parsed = ListRulesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let query = db.select().from(rulesTable);
  if (parsed.data.vehicleType) {
    query = query.where(eq(rulesTable.vehicleType, parsed.data.vehicleType)) as typeof query;
  }
  const items = await query;
  const totalResult = await db.select({ count: count() }).from(rulesTable);

  res.json({
    items: items.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    total: Number(totalResult[0]?.count ?? 0),
  });
});

router.post("/rules", async (req, res): Promise<void> => {
  const body = CreateRuleBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [rule] = await db
    .insert(rulesTable)
    .values({ ...body.data, isActive: body.data.isActive ?? true })
    .returning();
  res.status(201).json({
    ...rule,
    createdAt: rule!.createdAt.toISOString(),
    updatedAt: rule!.updatedAt.toISOString(),
  });
});

router.get("/rules/:id", async (req, res): Promise<void> => {
  const params = GetRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [rule] = await db.select().from(rulesTable).where(eq(rulesTable.id, params.data.id));
  if (!rule) {
    res.status(404).json({ error: "Rule not found" });
    return;
  }
  res.json({
    ...rule,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  });
});

router.patch("/rules/:id", async (req, res): Promise<void> => {
  const params = UpdateRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateRuleBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [rule] = await db
    .update(rulesTable)
    .set(body.data)
    .where(eq(rulesTable.id, params.data.id))
    .returning();
  if (!rule) {
    res.status(404).json({ error: "Rule not found" });
    return;
  }
  res.json({
    ...rule,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  });
});

router.delete("/rules/:id", async (req, res): Promise<void> => {
  const params = DeleteRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [rule] = await db.delete(rulesTable).where(eq(rulesTable.id, params.data.id)).returning();
  if (!rule) {
    res.status(404).json({ error: "Rule not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
