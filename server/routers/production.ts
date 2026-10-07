import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { syncInventoryToWooCommerce } from "../_core/woocommerce-sync";

export const productionRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

      return await db.getProductionRuns(workspace.id);
    } catch (error) {
      console.error("[Production] List error:", error);
      throw error;
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        runNumber: z.string().min(1),
        productId: z.number(),
        quantity: z.number().min(1),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        notes: z.string().optional(),
        materials: z.array(z.object({
          inputId: z.number(),
          quantityUsed: z.number(),
          unit: z.string().optional(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const { materials, ...runData } = input;
        const result = await db.createProductionRun({
          workspaceId: workspace.id,
          ...runData,
        });
        const runId = result?.insertId ?? (result as any)[0]?.insertId;
        console.log("[Production] Created run id:", runId, "materials:", materials?.length || 0);

        if (materials && materials.length > 0 && runId) {
          for (const mat of materials) {
            if (mat.inputId > 0 && mat.quantityUsed > 0) {
              console.log("[Production] Saving material:", mat.inputId, mat.quantityUsed);
              await db.addProductionRunInput({
                workspaceId: workspace.id,
                productionRunId: runId,
                inputId: mat.inputId,
                quantityUsed: mat.quantityUsed,
                unit: mat.unit || "g",
              });
            }
          }
        }
        return { id: runId, ...runData };
      } catch (error) {
        console.error("[Production] Create error:", error);
        throw error;
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        runNumber: z.string().optional(),
        productId: z.number().optional(),
        quantity: z.number().optional(),
        status: z.enum(["planned", "in_progress", "completed", "quality_check", "approved"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const run = await db.getProductionRunById(input.id);
        if (!run || run.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Production run not found" });
        }

        return await db.updateProductionRun(input.id, input);
      } catch (error) {
        console.error("[Production] Update error:", error);
        throw error;
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const run = await db.getProductionRunById(input.id);
        if (!run || run.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Production run not found" });
        }

        await db.deleteProductionRun(input.id);
        return { success: true };
      } catch (error) {
        console.error("[Production] Delete error:", error);
        throw error;
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const run = await db.getProductionRunById(input.id);
        if (!run || run.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Production run not found" });
        }

        return run;
      } catch (error) {
        console.error("[Production] GetById error:", error);
        throw error;
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["planned", "in_progress", "completed", "quality_check", "approved"]) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const run = await db.getProductionRunById(input.id);
        if (!run || run.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Production run not found" });
        }

        await db.updateProductionRun(input.id, { status: input.status });

        // When production is completed or approved, add to inventory, deduct raw inputs, sync to WooCommerce
        if (input.status === "completed" || input.status === "approved") {
          try {
            const products = await db.getProductById(run.productId);
            if (products.length > 0) {
              const product = products[0];
              const newStock = (product.currentStock || 0) + run.quantity;
              await db.updateProduct(run.productId, { currentStock: newStock });
              await syncInventoryToWooCommerce({
                productId: run.productId,
                quantity: newStock,
                productName: product.name,
                sku: product.sku || undefined,
              });
              console.log(`[Production] Synced ${product.name} stock (${newStock} units) to WooCommerce`);
            }
          } catch (syncError) {
            console.error("[Production] Failed to sync inventory to WooCommerce:", syncError);
          }
          // Deduct raw input stock
          try {
            const materials = await db.getProductionRunInputs(run.id);
            const rows = (materials as any)[0] ?? materials;
            if (Array.isArray(rows)) {
              for (const mat of rows) {
                if (mat.inputId && mat.quantityUsed > 0) {
                  await db.deductInputStock(mat.inputId, parseFloat(mat.quantityUsed));
                  console.log(`[Production] Deducted ${mat.quantityUsed} ${mat.unit} of input ${mat.inputId}`);
                }
              }
            }
          } catch (deductError) {
            console.error("[Production] Failed to deduct input stock:", deductError);
          }
        }

        return { success: true, message: "Production status updated" };
      } catch (error) {
        console.error("[Production] UpdateStatus error:", error);
        throw error;
      }
    }),

  // Get materials used in a production run
  getRunInputs: protectedProcedure
    .input(z.object({ productionRunId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
        return await db.getProductionRunInputs(input.productionRunId);
      } catch (error) {
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get materials + calculated cost for a product (from latest completed run)
  getProductCostData: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
        const runs = await db.getProductionRuns(workspace.id);
        const productRuns = runs.filter((r: any) =>
          r.productId === input.productId &&
          (r.status === "completed" || r.status === "approved")
        );
        if (!productRuns.length) return { materials: [], costPerUnit: null };
        const latestRun = productRuns[productRuns.length - 1];
        const materials = await db.getProductionRunInputs(latestRun.id);
        const rows = Array.isArray((materials as any)[0]) ? (materials as any)[0] : materials;
        // Calculate total material cost
        let totalCost = 0;
        for (const mat of (rows as any[])) {
          const input_data = await db.getInputById(mat.inputId);
          if (input_data) {
            totalCost += parseFloat(mat.quantityUsed) * parseFloat(input_data.costPerUnit as any);
          }
        }
        const costPerUnit = latestRun.quantity > 0 ? totalCost / latestRun.quantity : 0;
        return { materials: rows, costPerUnit: parseFloat(costPerUnit.toFixed(2)), runQuantity: latestRun.quantity, totalCost: parseFloat(totalCost.toFixed(2)) };
      } catch (error) {
        console.error("[Production] getProductCostData error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Save materials used (replaces all for that run)
  saveRunInputs: protectedProcedure
    .input(z.object({
      productionRunId: z.number(),
      materials: z.array(z.object({
        inputId: z.number(),
        quantityUsed: z.number(),
        unit: z.string().optional(),
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("[saveRunInputs] Called with runId:", input.productionRunId, "materials:", input.materials.length);
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
        await db.deleteProductionRunInputs(input.productionRunId);
        for (const mat of input.materials) {
          if (mat.inputId > 0 && mat.quantityUsed > 0) {
            console.log("[saveRunInputs] Inserting mat:", mat.inputId, mat.quantityUsed, mat.unit);
            await db.addProductionRunInput({
              workspaceId: workspace.id,
              productionRunId: input.productionRunId,
              inputId: mat.inputId,
              quantityUsed: mat.quantityUsed,
              unit: mat.unit,
            });
          }
        }
        console.log("[saveRunInputs] Done");
        return { success: true };
      } catch (error) {
        console.error("[saveRunInputs] ERROR:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Add stock to a raw input
  addInputStock: protectedProcedure
    .input(z.object({ inputId: z.number(), quantity: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
        return await db.addInputStock(input.inputId, input.quantity);
      } catch (error) {
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});

