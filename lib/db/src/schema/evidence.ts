import { pgTable, text, serial, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const evidenceTable = pgTable("evidence", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  deviceId: text("device_id").notNull(),
  signCode: text("sign_code"),
  decision: text("decision").notNull().default("pending"),
});

export const insertEvidenceSchema = createInsertSchema(evidenceTable).omit({ id: true });
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type Evidence = typeof evidenceTable.$inferSelect;
