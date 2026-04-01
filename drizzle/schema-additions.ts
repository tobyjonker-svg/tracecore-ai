/**
 * NEW TABLE: Production Run Materials
 * Add this to drizzle/schema.ts after the productionRuns table definition
 */

import { mysqlTable, int, decimal, varchar, text, timestamp } from "drizzle-orm/mysql-core";

// Production Run Materials - track which raw materials are used in each production run
export const productionRunMaterials = mysqlTable("productionRunMaterials", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  productionRunId: int("productionRunId").notNull(),
  inputId: int("inputId").notNull(),
  quantityUsed: decimal("quantityUsed", { precision: 12, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 50 }).default("kg"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductionRunMaterial = typeof productionRunMaterials.$inferSelect;
export type InsertProductionRunMaterial = typeof productionRunMaterials.$inferInsert;
