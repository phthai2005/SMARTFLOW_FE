import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const modelsTable = pgTable("ai_models", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  filename: text("filename").notNull(),
  releaseNote: text("release_note").notNull(),
  status: text("status").notNull().default("draft"),
  deployedAt: timestamp("deployed_at", { withTimezone: true }),
  deviceCount: integer("device_count").notNull().default(0),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertModelSchema = createInsertSchema(modelsTable).omit({ id: true, uploadedAt: true });
export type InsertModel = z.infer<typeof insertModelSchema>;
export type Model = typeof modelsTable.$inferSelect;
