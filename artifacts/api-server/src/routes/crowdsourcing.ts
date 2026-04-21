import { Router } from "express";
import { eq, desc, count, sql } from "drizzle-orm";
import { db, crowdsourcingReportsTable, signReportsTable } from "@workspace/db";
import {
  ListCrowdsourcingReportsQueryParams,
  UpdateCrowdsourcingReportParams,
  UpdateCrowdsourcingReportBody,
  GetCrowdsourcingReportParams,
  ListSignReportsQueryParams,
  UpdateSignReportParams,
  UpdateSignReportBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/crowdsourcing/reports", async (req, res): Promise<void> => {
  const parsed = ListCrowdsourcingReportsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  let query = db.select().from(crowdsourcingReportsTable);
  if (status) {
    query = query.where(eq(crowdsourcingReportsTable.status, status)) as typeof query;
  }

  const [items, totalResult] = await Promise.all([
    query.orderBy(desc(crowdsourcingReportsTable.submittedAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(crowdsourcingReportsTable),
  ]);

  const total = totalResult[0]?.count ?? 0;

  res.json({
    items: items.map((r) => ({
      ...r,
      submittedAt: r.submittedAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
    })),
    total: Number(total),
    page,
    limit,
  });
});

router.get("/crowdsourcing/reports/:id", async (req, res): Promise<void> => {
  const params = GetCrowdsourcingReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [report] = await db
    .select()
    .from(crowdsourcingReportsTable)
    .where(eq(crowdsourcingReportsTable.id, params.data.id));
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json({
    ...report,
    submittedAt: report.submittedAt.toISOString(),
    reviewedAt: report.reviewedAt?.toISOString() ?? null,
  });
});

router.patch("/crowdsourcing/reports/:id", async (req, res): Promise<void> => {
  const params = UpdateCrowdsourcingReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateCrowdsourcingReportBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [report] = await db
    .update(crowdsourcingReportsTable)
    .set({
      status: body.data.status,
      notes: body.data.notes,
      reviewedAt: new Date(),
    })
    .where(eq(crowdsourcingReportsTable.id, params.data.id))
    .returning();
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json({
    ...report,
    submittedAt: report.submittedAt.toISOString(),
    reviewedAt: report.reviewedAt?.toISOString() ?? null,
  });
});

router.get("/crowdsourcing/sign-reports", async (req, res): Promise<void> => {
  const parsed = ListSignReportsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const items = await db.select().from(signReportsTable).orderBy(desc(signReportsTable.lastReportedAt));
  const totalResult = await db.select({ count: count() }).from(signReportsTable);

  res.json({
    items: items.map((r) => ({
      ...r,
      lastReportedAt: r.lastReportedAt.toISOString(),
    })),
    total: Number(totalResult[0]?.count ?? 0),
  });
});

router.patch("/crowdsourcing/sign-reports/:id", async (req, res): Promise<void> => {
  const params = UpdateSignReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateSignReportBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [report] = await db
    .update(signReportsTable)
    .set({ visibility: body.data.visibility })
    .where(eq(signReportsTable.id, params.data.id))
    .returning();
  if (!report) {
    res.status(404).json({ error: "Sign report not found" });
    return;
  }
  res.json({
    ...report,
    lastReportedAt: report.lastReportedAt.toISOString(),
  });
});

router.get("/crowdsourcing/stats", async (_req, res): Promise<void> => {
  const [pendingResult, approvedResult, rejectedResult] = await Promise.all([
    db.select({ count: count() }).from(crowdsourcingReportsTable).where(eq(crowdsourcingReportsTable.status, "pending")),
    db
      .select({ count: count() })
      .from(crowdsourcingReportsTable)
      .where(eq(crowdsourcingReportsTable.status, "approved")),
    db
      .select({ count: count() })
      .from(crowdsourcingReportsTable)
      .where(eq(crowdsourcingReportsTable.status, "rejected")),
  ]);

  const totalPending = Number(pendingResult[0]?.count ?? 0);
  const totalApproved = Number(approvedResult[0]?.count ?? 0);
  const totalRejected = Number(rejectedResult[0]?.count ?? 0);
  const total = totalApproved + totalRejected;
  const approvalRate = total > 0 ? totalApproved / total : 0;

  const recentActivity = [
    { date: "2025-04-15", count: 12 },
    { date: "2025-04-16", count: 8 },
    { date: "2025-04-17", count: 15 },
    { date: "2025-04-18", count: 6 },
    { date: "2025-04-19", count: 20 },
    { date: "2025-04-20", count: 11 },
    { date: "2025-04-21", count: 9 },
  ];

  res.json({ totalPending, totalApproved, totalRejected, approvalRate, recentActivity });
});

export default router;
