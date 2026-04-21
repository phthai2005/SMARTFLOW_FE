import { Router } from "express";
import { count } from "drizzle-orm";
import { db, evidenceTable } from "@workspace/db";
import { ListEvidenceQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/evidence", async (req, res): Promise<void> => {
  const parsed = ListEvidenceQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const items = await db.select().from(evidenceTable).limit(limit).offset(offset);
  const totalResult = await db.select({ count: count() }).from(evidenceTable);

  res.json({
    items: items.map((e) => ({
      ...e,
      capturedAt: e.capturedAt.toISOString(),
    })),
    total: Number(totalResult[0]?.count ?? 0),
  });
});

router.get("/evidence/stats", async (_req, res): Promise<void> => {
  const [totalResult, approvedResult, pendingResult] = await Promise.all([
    db.select({ count: count() }).from(evidenceTable),
    db.select({ count: count() }).from(evidenceTable),
    db.select({ count: count() }).from(evidenceTable),
  ]);

  const items = await db.select().from(evidenceTable);

  const heatmapPoints = items.map((e) => ({
    lat: e.lat,
    lng: e.lng,
    weight: 1,
  }));

  res.json({
    totalImages: Number(totalResult[0]?.count ?? 0),
    approvedCount: Number(approvedResult[0]?.count ?? 0),
    pendingCount: Number(pendingResult[0]?.count ?? 0),
    heatmapPoints,
  });
});

export default router;
