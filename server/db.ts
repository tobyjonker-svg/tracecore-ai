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
