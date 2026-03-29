import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, InsertProduct, products, InsertInventoryActivity, inventoryActivity } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _db = drizzle(ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ──────────────────────────────────────────────────────────────
// Payment Queries
// ──────────────────────────────────────────────────────────────

import { payments, subscriptions, workspaces, Payment, InsertPayment } from "../drizzle/schema";
import { and, desc } from "drizzle-orm";

/**
 * Get all payments for a workspace with pagination
 */
export async function getPaymentsByWorkspace(
  workspaceId: number,
  limit: number = 50,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payments: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.workspaceId, workspaceId))
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get payments:", error);
    throw error;
  }
}

/**
 * Get payment statistics for a workspace
 */
export async function getPaymentStats(workspaceId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payment stats: database not available");
    return null;
  }

  try {
    const allPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.workspaceId, workspaceId));

    const totalCount = allPayments.length;
    const pendingCount = allPayments.filter(p => p.status === 'pending').length;
    const completedCount = allPayments.filter(p => p.status === 'completed').length;
    const failedCount = allPayments.filter(p => p.status === 'failed').length;

    const totalRevenue = allPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalCount,
      pendingCount,
      completedCount,
      failedCount,
      totalRevenue,
    };
  } catch (error) {
    console.error("[Database] Failed to get payment stats:", error);
    throw error;
  }
}

/**
 * Get a single payment by ID
 */
export async function getPaymentById(paymentId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payment: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get payment:", error);
    throw error;
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: number,
  status: 'pending' | 'completed' | 'failed'
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update payment: database not available");
    return null;
  }

  try {
    const result = await db
      .update(payments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));

    return result;
  } catch (error) {
    console.error("[Database] Failed to update payment:", error);
    throw error;
  }
}

/**
 * Create a new payment
 */
export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create payment: database not available");
    return null;
  }

  try {
    const result = await db
      .insert(payments)
      .values({
        ...payment,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    return result;
  } catch (error) {
    console.error("[Database] Failed to create payment:", error);
    throw error;
  }
}

/**
 * Get workspace with payment info
 */
export async function createWorkspace(userId: number, name: string = 'My Workspace') {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create workspace: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(workspaces).values({
      userId,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Get the created workspace
    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.userId, userId))
      .limit(1);

    return workspace.length > 0 ? workspace[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create workspace:", error);
    throw error;
  }
}

export async function getWorkspaceByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get workspace: database not available");
    return undefined;
  }

  try {
    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.userId, userId))
      .limit(1);

    return workspace.length > 0 ? workspace[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get workspace:", error);
    throw error;
  }
}

export async function getWorkspaceWithPayments(workspaceId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get workspace: database not available");
    return undefined;
  }

  try {
    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    return workspace.length > 0 ? workspace[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get workspace:", error);
    throw error;
  }
}


// ──────────────────────────────────────────────────────────────
// Workflow Queries
// ──────────────────────────────────────────────────────────────

import { workflowStages, workflowAnalytics } from "../drizzle/schema";
import { avg, count } from "drizzle-orm";

/**
 * Get all workflow stages for a workspace
 */
export async function getWorkflowStages(workspaceId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get workflow stages: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(workflowStages)
      .where(eq(workflowStages.workspaceId, workspaceId))
      .orderBy(workflowStages.stageOrder);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get workflow stages:", error);
    throw error;
  }
}

/**
 * Save workflow stages for a workspace
 */
export async function saveWorkflowStages(
  workspaceId: number,
  stages: Array<{ name: string; icon: string; color: string }>
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save workflow stages: database not available");
    return [];
  }

  try {
    // Delete existing stages
    await db.delete(workflowStages).where(eq(workflowStages.workspaceId, workspaceId));

    // Insert new stages
    if (stages.length > 0) {
      await db.insert(workflowStages).values(
        stages.map((stage, idx) => ({
          workspaceId,
          stageOrder: idx + 1,
          name: stage.name,
          icon: stage.icon,
          color: stage.color,
        }))
      );
    }

    return getWorkflowStages(workspaceId);
  } catch (error) {
    console.error("[Database] Failed to save workflow stages:", error);
    throw error;
  }
}

/**
 * Track workflow analytics event
 */
export async function trackWorkflowAnalytics(
  workspaceId: number | undefined,
  templateUsed: string,
  customizationCount: number,
  stagesCount: number,
  source: string = 'landing'
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot track workflow analytics: database not available");
    return null;
  }

  try {
    const result = await db.insert(workflowAnalytics).values({
      workspaceId: workspaceId || undefined,
      templateUsed,
      customizationCount,
      stagesCount,
      source,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to track workflow analytics:", error);
    throw error;
  }
}

/**
 * Get workflow analytics events
 */
export async function getWorkflowAnalytics(limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get workflow analytics: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(workflowAnalytics)
      .orderBy(desc(workflowAnalytics.createdAt))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get workflow analytics:", error);
    throw error;
  }
}

/**
 * Get workflow analytics summary by template
 */
export async function getWorkflowAnalyticsSummary() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get workflow analytics summary: database not available");
    return [];
  }

  try {
    const result = await db
      .select({
        template: workflowAnalytics.templateUsed,
        count: count(workflowAnalytics.id).as('count'),
        avgCustomizations: avg(workflowAnalytics.customizationCount).as('avgCustomizations'),
        avgStages: avg(workflowAnalytics.stagesCount).as('avgStages'),
      })
      .from(workflowAnalytics)
      .groupBy(workflowAnalytics.templateUsed);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get workflow analytics summary:", error);
    throw error;
  }
}

// Products - cost and margin tracking
export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

export async function getProductsByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(products).where(eq(products.workspaceId, workspaceId));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(products).where(eq(products.id, id)).limit(1);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

// Inventory Activity - track cost and margin
export async function recordInventoryActivity(data: InsertInventoryActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(inventoryActivity).values(data);
  return result;
}

export async function getInventoryByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(inventoryActivity).where(eq(inventoryActivity.workspaceId, workspaceId));
}

export async function getInventoryByProduct(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(inventoryActivity).where(eq(inventoryActivity.productId, productId));
}

// Calculate inventory valuation
export async function getInventoryValuation(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const prods = await db.select().from(products).where(eq(products.workspaceId, workspaceId));
  
  return prods.map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    currentStock: p.currentStock,
    costPerUnit: parseFloat(p.costPerUnit.toString()),
    sellingPrice: parseFloat(p.sellingPrice.toString()),
    totalCostValue: p.currentStock * parseFloat(p.costPerUnit.toString()),
    totalSellingValue: p.currentStock * parseFloat(p.sellingPrice.toString()),
    profitPerUnit: parseFloat(p.sellingPrice.toString()) - parseFloat(p.costPerUnit.toString()),
    profitMarginPercent: ((parseFloat(p.sellingPrice.toString()) - parseFloat(p.costPerUnit.toString())) / parseFloat(p.sellingPrice.toString()) * 100).toFixed(2),
  }));
}


// ──────────────────────────────────────────────────────────────
// Inputs (Raw Materials) Queries
// ──────────────────────────────────────────────────────────────

import { inputs, Input, InsertInput } from "../drizzle/schema";

export async function getInputsByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inputs: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(inputs)
      .where(eq(inputs.workspaceId, workspaceId))
      .orderBy(desc(inputs.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get inputs:", error);
    throw error;
  }
}

export async function getInputById(inputId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get input: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(inputs)
      .where(eq(inputs.id, inputId))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get input:", error);
    throw error;
  }
}

export async function createInput(input: InsertInput) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create input: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(inputs).values(input);
    const createdInput = await db
      .select()
      .from(inputs)
      .where(eq(inputs.workspaceId, input.workspaceId))
      .orderBy(desc(inputs.createdAt))
      .limit(1);

    return createdInput.length > 0 ? createdInput[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create input:", error);
    throw error;
  }
}

export async function updateInput(
  inputId: number,
  updates: Partial<InsertInput>
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update input: database not available");
    return undefined;
  }

  try {
    await db.update(inputs).set(updates).where(eq(inputs.id, inputId));
    return await getInputById(inputId);
  } catch (error) {
    console.error("[Database] Failed to update input:", error);
    throw error;
  }
}

export async function deleteInput(inputId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete input: database not available");
    return undefined;
  }

  try {
    await db.delete(inputs).where(eq(inputs.id, inputId));
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete input:", error);
    throw error;
  }
}


// ──────────────────────────────────────────────────────────────
// Inventory Activity Queries
// ──────────────────────────────────────────────────────────────

import { gte, lte } from "drizzle-orm";

export async function getInventoryActivities(
  workspaceId: number,
  type?: string,
  productId?: number,
  startDate?: Date,
  endDate?: Date
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inventory activities: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(inventoryActivity)
      .where(eq(inventoryActivity.workspaceId, workspaceId))
      .orderBy(desc(inventoryActivity.createdAt));

    let filtered = result;
    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }
    if (productId) {
      filtered = filtered.filter(a => a.productId === productId);
    }
    if (startDate) {
      filtered = filtered.filter(a => a.createdAt >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(a => a.createdAt <= endDate);
    }

    return filtered;
  } catch (error) {
    console.error("[Database] Failed to get inventory activities:", error);
    throw error;
  }
}

export async function createInventoryActivity(data: {
  workspaceId: number;
  productId: number;
  type: string;
  quantity: number;
  costPerUnit?: number;
  sellingPrice?: number;
  supplierId?: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create inventory activity: database not available");
    return undefined;
  }

  try {
    const totalCost = data.costPerUnit ? data.quantity * data.costPerUnit : undefined;
    const totalValue = data.sellingPrice ? data.quantity * data.sellingPrice : undefined;

    const result = await db.insert(inventoryActivity).values({
      workspaceId: data.workspaceId,
      productId: data.productId,
      type: data.type as any,
      quantity: data.quantity,
      costPerUnit: data.costPerUnit ? data.costPerUnit.toString() : undefined,
      sellingPrice: data.sellingPrice ? data.sellingPrice.toString() : undefined,
      totalCost: totalCost ? totalCost.toString() : undefined,
      totalValue: totalValue ? totalValue.toString() : undefined,
      supplierId: data.supplierId,
      notes: data.notes,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to create inventory activity:", error);
    throw error;
  }
}

export async function getInventoryActivityById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inventory activity: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(inventoryActivity).where(eq(inventoryActivity.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get inventory activity:", error);
    throw error;
  }
}

export async function deleteInventoryActivity(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete inventory activity: database not available");
    return undefined;
  }

  try {
    await db.delete(inventoryActivity).where(eq(inventoryActivity.id, id));
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete inventory activity:", error);
    throw error;
  }
}

export async function getInventoryActivitySummary(
  workspaceId: number,
  type?: string,
  startDate?: Date,
  endDate?: Date
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inventory activity summary: database not available");
    return null;
  }

  try {
    const activities = await getInventoryActivities(workspaceId, type, undefined, startDate, endDate);

    // Calculate summary statistics
    const totalQuantity = activities.reduce((sum, a) => sum + a.quantity, 0);
    const totalCost = activities.reduce((sum, a) => sum + (parseFloat(a.totalCost || '0')), 0);
    const totalValue = activities.reduce((sum, a) => sum + (parseFloat(a.totalValue || '0')), 0);

    return {
      totalQuantity,
      totalCost,
      totalValue,
      transactionCount: activities.length,
      activities,
    };
  } catch (error) {
    console.error("[Database] Failed to get inventory activity summary:", error);
    throw error;
  }
}


// ── Batch/Lot Tracking ──────────────────────────────────────────

export async function createBatchLot(data: {
  workspaceId: number;
  productId?: number;
  inputId?: number;
  batchNumber: string;
  quantity: number | string;
  unit?: string;
  manufacturedDate?: Date;
  expiryDate?: Date;
  qualityStatus?: "pending" | "approved" | "rejected" | "expired";
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { batchLots } = await import("../drizzle/schema");
    const result = await db.insert(batchLots).values({
      workspaceId: data.workspaceId,
      productId: data.productId || null,
      inputId: data.inputId || null,
      batchNumber: data.batchNumber,
      quantity: (typeof data.quantity === "string" ? data.quantity : data.quantity.toString()) as any,
      unit: data.unit || "units",
      manufacturedDate: data.manufacturedDate || null,
      expiryDate: data.expiryDate || null,
      qualityStatus: (data.qualityStatus || "pending") as any,
      notes: data.notes || null,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create batch lot:", error);
    throw error;
  }
}

export async function getBatchLots(workspaceId: number, filters?: { productId?: number; inputId?: number; qualityStatus?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { batchLots } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    const conditions = [eq(batchLots.workspaceId, workspaceId)];
    if (filters?.productId) conditions.push(eq(batchLots.productId, filters.productId));
    if (filters?.inputId) conditions.push(eq(batchLots.inputId, filters.inputId));
    if (filters?.qualityStatus) conditions.push(eq(batchLots.qualityStatus as any, filters.qualityStatus));

    const result = await db.select().from(batchLots).where(and(...conditions));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get batch lots:", error);
    throw error;
  }
}

export async function getBatchLotById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { batchLots } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const result = await db.select().from(batchLots).where(eq(batchLots.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get batch lot by ID:", error);
    throw error;
  }
}

export async function updateBatchLot(id: number, data: Partial<{
  batchNumber: string;
  quantity: number | string;
  unit: string;
  manufacturedDate: Date;
  expiryDate: Date;
  qualityStatus: "pending" | "approved" | "rejected" | "expired";
  notes: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { batchLots } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const updateData: any = {};
    if (data.batchNumber !== undefined) updateData.batchNumber = data.batchNumber;
    if (data.quantity !== undefined) updateData.quantity = (typeof data.quantity === "string" ? data.quantity : data.quantity.toString()) as any;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.manufacturedDate !== undefined) updateData.manufacturedDate = data.manufacturedDate;
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate;
    if (data.qualityStatus !== undefined) updateData.qualityStatus = data.qualityStatus as any;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const result = await db.update(batchLots).set(updateData).where(eq(batchLots.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update batch lot:", error);
    throw error;
  }
}

export async function deleteBatchLot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { batchLots } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const result = await db.delete(batchLots).where(eq(batchLots.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete batch lot:", error);
    throw error;
  }
}

export async function getExpiringBatches(workspaceId: number, daysUntilExpiry: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { batchLots } = await import("../drizzle/schema");
    const { eq, and, gte, lte, isNotNull } = await import("drizzle-orm");

    const now = new Date();
    const futureDate = new Date(now.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000);

    const result = await db
      .select()
      .from(batchLots)
      .where(
        and(
          eq(batchLots.workspaceId, workspaceId),
          isNotNull(batchLots.expiryDate),
          gte(batchLots.expiryDate as any, now),
          lte(batchLots.expiryDate as any, futureDate)
        )
      );

    return result;
  } catch (error) {
    console.error("[Database] Failed to get expiring batches:", error);
    throw error;
  }
}


// ── Supplier Management ─────────────────────────────────────────

export async function createSupplier(data: {
  workspaceId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { suppliers } = await import("../drizzle/schema");
    const result = await db.insert(suppliers).values({
      workspaceId: data.workspaceId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      notes: data.notes || null,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create supplier:", error);
    throw error;
  }
}

export async function getSuppliers(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { suppliers } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const result = await db.select().from(suppliers).where(eq(suppliers.workspaceId, workspaceId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get suppliers:", error);
    throw error;
  }
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { suppliers } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const result = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get supplier by ID:", error);
    throw error;
  }
}

export async function updateSupplier(id: number, data: Partial<{
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  notes: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { suppliers } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.country !== undefined) updateData.country = data.country || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    const result = await db.update(suppliers).set(updateData).where(eq(suppliers.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update supplier:", error);
    throw error;
  }
}

export async function deleteSupplier(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { suppliers } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete supplier:", error);
    throw error;
  }
}

// Supplier Pricing History
export async function addPricingHistory(data: {
  workspaceId: number;
  supplierId: number;
  inputId: number;
  price: number | string;
  unit?: string;
  effectiveDate?: Date;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { supplierPricingHistory } = await import("../drizzle/schema");
    const result = await db.insert(supplierPricingHistory).values({
      workspaceId: data.workspaceId,
      supplierId: data.supplierId,
      inputId: data.inputId,
      price: (typeof data.price === "string" ? data.price : data.price.toString()) as any,
      unit: data.unit || "kg",
      effectiveDate: data.effectiveDate || null,
      notes: data.notes || null,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to add pricing history:", error);
    throw error;
  }
}

export async function getPricingHistory(workspaceId: number, supplierId?: number, inputId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { supplierPricingHistory } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    const conditions = [eq(supplierPricingHistory.workspaceId, workspaceId)];
    if (supplierId) conditions.push(eq(supplierPricingHistory.supplierId, supplierId));
    if (inputId) conditions.push(eq(supplierPricingHistory.inputId, inputId));

    const result = await db.select().from(supplierPricingHistory).where(and(...conditions));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get pricing history:", error);
    throw error;
  }
}

// Supplier Performance
export async function getSupplierPerformance(workspaceId: number, supplierId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { supplierPerformance } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    const result = await db
      .select()
      .from(supplierPerformance)
      .where(and(eq(supplierPerformance.workspaceId, workspaceId), eq(supplierPerformance.supplierId, supplierId)));

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get supplier performance:", error);
    throw error;
  }
}

export async function updateSupplierPerformance(
  workspaceId: number,
  supplierId: number,
  data: Partial<{
    totalOrders: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
    qualityIssues: number;
    averageRating: number | string;
    lastOrderDate: Date;
    totalSpent: number | string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { supplierPerformance } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    const updateData: any = {};
    if (data.totalOrders !== undefined) updateData.totalOrders = data.totalOrders;
    if (data.onTimeDeliveries !== undefined) updateData.onTimeDeliveries = data.onTimeDeliveries;
    if (data.lateDeliveries !== undefined) updateData.lateDeliveries = data.lateDeliveries;
    if (data.qualityIssues !== undefined) updateData.qualityIssues = data.qualityIssues;
    if (data.averageRating !== undefined) updateData.averageRating = (typeof data.averageRating === "string" ? data.averageRating : data.averageRating.toString()) as any;
    if (data.lastOrderDate !== undefined) updateData.lastOrderDate = data.lastOrderDate;
    if (data.totalSpent !== undefined) updateData.totalSpent = (typeof data.totalSpent === "string" ? data.totalSpent : data.totalSpent.toString()) as any;

    const result = await db
      .update(supplierPerformance)
      .set(updateData)
      .where(and(eq(supplierPerformance.workspaceId, workspaceId), eq(supplierPerformance.supplierId, supplierId)));

    return result;
  } catch (error) {
    console.error("[Database] Failed to update supplier performance:", error);
    throw error;
  }
}

export async function getAllSupplierPerformance(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { supplierPerformance } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const result = await db.select().from(supplierPerformance).where(eq(supplierPerformance.workspaceId, workspaceId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get all supplier performance:", error);
    throw error;
  }
}


// ===== ALERTS =====

export async function getAlerts(workspaceId: number, filters?: { isRead?: boolean; type?: string; severity?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { alerts } = await import("../drizzle/schema");
    let query = db.select().from(alerts).where(eq(alerts.workspaceId, workspaceId)) as any;

    if (filters?.isRead !== undefined) {
      query = query.where(eq(alerts.isRead, filters.isRead ? 1 : 0));
    }
    if (filters?.type) {
      query = query.where(eq(alerts.type, filters.type as any));
    }
    if (filters?.severity) {
      query = query.where(eq(alerts.severity, filters.severity as any));
    }

    return await query.orderBy(desc(alerts.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get alerts:", error);
    throw error;
  }
}

export async function getUnreadAlerts(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { alerts } = await import("../drizzle/schema");
    return db
      .select()
      .from(alerts)
      .where(and(eq(alerts.workspaceId, workspaceId), eq(alerts.isRead, 0)))
      .orderBy(desc(alerts.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get unread alerts:", error);
    throw error;
  }
}

export async function createAlert(data: {
  workspaceId: number;
  type: "low_stock" | "expiring_batch" | "late_delivery" | "quality_issue" | "system";
  message: string;
  severity?: "info" | "warning" | "critical";
  relatedProductId?: number;
  relatedBatchId?: number;
  relatedSupplierId?: number;
  actionUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { alerts } = await import("../drizzle/schema");
    return db.insert(alerts).values({
      ...data,
      severity: data.severity || "info",
      isRead: 0,
    });
  } catch (error) {
    console.error("[Database] Failed to create alert:", error);
    throw error;
  }
}

export async function markAlertAsRead(alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { alerts } = await import("../drizzle/schema");
    return db.update(alerts).set({ isRead: 1 }).where(eq(alerts.id, alertId));
  } catch (error) {
    console.error("[Database] Failed to mark alert as read:", error);
    throw error;
  }
}

export async function markAllAlertsAsRead(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { alerts } = await import("../drizzle/schema");
    return db.update(alerts).set({ isRead: 1 }).where(eq(alerts.workspaceId, workspaceId));
  } catch (error) {
    console.error("[Database] Failed to mark all alerts as read:", error);
    throw error;
  }
}

export async function deleteAlert(alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { alerts } = await import("../drizzle/schema");
    return db.delete(alerts).where(eq(alerts.id, alertId));
  } catch (error) {
    console.error("[Database] Failed to delete alert:", error);
    throw error;
  }
}

export async function deleteAlertsByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { alerts } = await import("../drizzle/schema");
    return db.delete(alerts).where(eq(alerts.workspaceId, workspaceId));
  } catch (error) {
    console.error("[Database] Failed to delete workspace alerts:", error);
    throw error;
  }
}

export async function getAlertById(alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { alerts } = await import("../drizzle/schema");
    const result = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get alert by ID:", error);
    throw error;
  }
}


// ===== ORDERS =====

export async function getOrders(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { orders } = await import("../drizzle/schema");
    return await db.select().from(orders).where(eq(orders.workspaceId, workspaceId)).orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get orders:", error);
    throw error;
  }
}

export async function createOrder(data: {
  workspaceId: number;
  orderNumber: string;
  customerId: string;
  customerName: string;
  productId: number;
  quantity: number;
  totalPrice: string;
  dueDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { orders } = await import("../drizzle/schema");
    return await db.insert(orders).values({
      ...data,
      status: "pending",
    });
  } catch (error) {
    console.error("[Database] Failed to create order:", error);
    throw error;
  }
}

export async function updateOrder(id: number, data: Partial<any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { orders } = await import("../drizzle/schema");
    return await db.update(orders).set({ ...data, updatedAt: new Date() }).where(eq(orders.id, id));
  } catch (error) {
    console.error("[Database] Failed to update order:", error);
    throw error;
  }
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { orders } = await import("../drizzle/schema");
    return await db.delete(orders).where(eq(orders.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete order:", error);
    throw error;
  }
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { orders } = await import("../drizzle/schema");
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get order by ID:", error);
    throw error;
  }
}

// ===== PRODUCTION RUNS =====

export async function getProductionRuns(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { productionRuns } = await import("../drizzle/schema");
    return await db.select().from(productionRuns).where(eq(productionRuns.workspaceId, workspaceId)).orderBy(desc(productionRuns.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get production runs:", error);
    throw error;
  }
}

export async function createProductionRun(data: {
  workspaceId: number;
  runNumber: string;
  productId: number;
  quantity: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { productionRuns } = await import("../drizzle/schema");
    return await db.insert(productionRuns).values({
      ...data,
      status: "planned",
    });
  } catch (error) {
    console.error("[Database] Failed to create production run:", error);
    throw error;
  }
}

export async function updateProductionRun(id: number, data: Partial<any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { productionRuns } = await import("../drizzle/schema");
    return await db.update(productionRuns).set({ ...data, updatedAt: new Date() }).where(eq(productionRuns.id, id));
  } catch (error) {
    console.error("[Database] Failed to update production run:", error);
    throw error;
  }
}

export async function deleteProductionRun(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { productionRuns } = await import("../drizzle/schema");
    return await db.delete(productionRuns).where(eq(productionRuns.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete production run:", error);
    throw error;
  }
}

export async function getProductionRunById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { productionRuns } = await import("../drizzle/schema");
    const result = await db.select().from(productionRuns).where(eq(productionRuns.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get production run by ID:", error);
    throw error;
  }
}

// ===== SHIPMENTS =====

export async function getShipments(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { shipments } = await import("../drizzle/schema");
    return await db.select().from(shipments).where(eq(shipments.workspaceId, workspaceId)).orderBy(desc(shipments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get shipments:", error);
    throw error;
  }
}

export async function createShipment(data: {
  workspaceId: number;
  orderId: number;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { shipments } = await import("../drizzle/schema");
    return await db.insert(shipments).values({
      ...data,
      status: "pending",
    });
  } catch (error) {
    console.error("[Database] Failed to create shipment:", error);
    throw error;
  }
}

export async function updateShipment(id: number, data: Partial<any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { shipments } = await import("../drizzle/schema");
    return await db.update(shipments).set({ ...data, updatedAt: new Date() }).where(eq(shipments.id, id));
  } catch (error) {
    console.error("[Database] Failed to update shipment:", error);
    throw error;
  }
}

export async function deleteShipment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { shipments } = await import("../drizzle/schema");
    return await db.delete(shipments).where(eq(shipments.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete shipment:", error);
    throw error;
  }
}

export async function getShipmentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { shipments } = await import("../drizzle/schema");
    const result = await db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get shipment by ID:", error);
    throw error;
  }
}
