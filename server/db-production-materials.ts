/**
 * Database helpers for production run materials
 * Add these functions to server/db.ts
 */

import { eq, and } from "drizzle-orm";
import { productionRunMaterials, InsertProductionRunMaterial } from "../drizzle/schema";

export async function createProductionRunMaterial(data: InsertProductionRunMaterial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(productionRunMaterials).values(data);
}

export async function getProductionRunMaterials(productionRunId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(productionRunMaterials).where(eq(productionRunMaterials.productionRunId, productionRunId));
}

export async function deleteProductionRunMaterial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(productionRunMaterials).where(eq(productionRunMaterials.id, id));
}

export async function deleteProductionRunMaterials(productionRunId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(productionRunMaterials).where(eq(productionRunMaterials.productionRunId, productionRunId));
}
