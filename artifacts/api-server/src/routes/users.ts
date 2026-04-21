import { Router } from "express";
import { eq, count } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  ListUsersQueryParams,
  CreateUserBody,
  UpdateUserParams,
  UpdateUserBody,
  DeleteUserParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/users", async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { vehicleType, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  let query = db.select().from(usersTable);
  if (vehicleType) {
    query = query.where(eq(usersTable.vehicleType, vehicleType)) as typeof query;
  }
  const items = await query.limit(limit).offset(offset);
  const totalResult = await db.select({ count: count() }).from(usersTable);

  res.json({
    items: items.map((u) => ({
      ...u,
      registeredAt: u.registeredAt.toISOString(),
    })),
    total: Number(totalResult[0]?.count ?? 0),
  });
});

router.post("/users", async (req, res): Promise<void> => {
  const body = CreateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [user] = await db.insert(usersTable).values(body.data).returning();
  res.status(201).json({
    ...user,
    registeredAt: user!.registeredAt.toISOString(),
  });
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set(body.data)
    .where(eq(usersTable.id, params.data.id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    ...user,
    registeredAt: user.registeredAt.toISOString(),
  });
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.delete(usersTable).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
