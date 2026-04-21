import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const crowdsourcingReportsTable = pgTable("crowdsourcing_reports", {
  id: serial("id").primaryKey(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  imageUrl: text("image_url"),
  signCode: text("sign_code").notNull(),
  signType: text("sign_type").notNull(),
  confidenceScore: real("confidence_score").notNull(),
  status: text("status").notNull().default("pending"),
  submittedBy: text("submitted_by").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  notes: text("notes"),
});

export const insertCrowdsourcingReportSchema = createInsertSchema(crowdsourcingReportsTable).omit({ id: true });
export type InsertCrowdsourcingReport = z.infer<typeof insertCrowdsourcingReportSchema>;
export type CrowdsourcingReport = typeof crowdsourcingReportsTable.$inferSelect;

export const signReportsTable = pgTable("sign_reports", {
  id: serial("id").primaryKey(),
  signId: integer("sign_id").notNull(),
  signCode: text("sign_code").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  reportCount: integer("report_count").notNull().default(1),
  reportType: text("report_type").notNull(),
  visibility: text("visibility").notNull().default("visible"),
  lastReportedAt: timestamp("last_reported_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSignReportSchema = createInsertSchema(signReportsTable).omit({ id: true });
export type InsertSignReport = z.infer<typeof insertSignReportSchema>;
export type SignReport = typeof signReportsTable.$inferSelect;
