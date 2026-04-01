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
        rawMaterials: z.array(
          z.object({
            inputId: z.number(),
            quantityUsed: z.number(),
            unit: z.string().optional(),
            notes: z.string().optional(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const { rawMaterials, ...runData } = input;
        const run = await db.createProductionRun({
          workspaceId: workspace.id,
          ...runData,
        });

        // Add raw materials if provided
        if (rawMaterials && rawMaterials.length > 0 && run && run.length > 0) {
          const runId = run[0]?.id;
          for (const material of rawMaterials) {
            await db.createProductionRunMaterial({
              workspaceId: workspace.id,
              productionRunId: runId,
              inputId: material.inputId,
              quantityUsed: material.quantityUsed.toString(),
              unit: material.unit || "kg",
              notes: material.notes,
            });
          }
        }

        return run;
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
        if (!run || run.length === 0 || run[0].workspaceId !== workspace.id) {
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
        if (!run || run.length === 0 || run[0].workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Production run not found" });
        }

        // Delete associated raw materials
        await db.deleteProductionRunMaterials(input.id);
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
        if (!run || run.length === 0 || run[0].workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Production run not found" });
        }

        // Get raw materials for this run
        const materials = await db.getProductionRunMaterials(input.id);

        return {
          ...run[0],
          rawMaterials: materials,
        };
      } catch (error) {
        console.error("[Production] GetById error:", error);
        throw error;
      }
    }),

  getRawMaterials: protectedProcedure
    .input(z.object({ productionRunId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        return await db.getProductionRunMaterials(input.productionRunId);
      } catch (error) {
        console.error("[Production] GetRawMaterials error:", error);
        throw error;
      }
    }),

  addRawMaterial: protectedProcedure
    .input(
      z.object({
        productionRunId: z.number(),
        inputId: z.number(),
        quantityUsed: z.number(),
        unit: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        return await db.createProductionRunMaterial({
          workspaceId: workspace.id,
          productionRunId: input.productionRunId,
          inputId: input.inputId,
          quantityUsed: input.quantityUsed.toString(),
          unit: input.unit || "kg",
          notes: input.notes,
        });
      } catch (error) {
        console.error("[Production] AddRawMaterial error:", error);
        throw error;
      }
    }),

  removeRawMaterial: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db.deleteProductionRunMaterial(input.id);
        return { success: true };
      } catch (error) {
        console.error("[Production] RemoveRawMaterial error:", error);
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
        if (!run || run.length === 0 || run[0].workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Production run not found" });
        }

        await db.updateProductionRun(input.id, { status: input.status });

        // When production is completed or approved, add to inventory and sync to WooCommerce
        if (input.status === "completed" || input.status === "approved") {
          try {
            // Get the product being produced
            const products = await db.getProductById(run[0].productId);
            if (products && products.length > 0) {
              const product = products[0];
              const newStock = (product.currentStock || 0) + run[0].quantity;

              // Update product stock in TraceCore
              await db.updateProduct(run[0].productId, { currentStock: newStock });

              // Deduct raw materials from inventory
              const materials = await db.getProductionRunMaterials(input.id);
              for (const material of materials) {
                const inputs = await db.getInputById(material.inputId);
                if (inputs && inputs.length > 0) {
                  const inputItem = inputs[0];
                  const currentStock = typeof inputItem.currentStock === 'string' ? parseFloat(inputItem.currentStock) : inputItem.currentStock || 0;
                  const newInputStock = Math.max(0, currentStock - parseFloat(material.quantityUsed));
                  await db.updateInput(material.inputId, { currentStock: newInputStock.toString() });
                  console.log(`[Production] Deducted ${material.quantityUsed} ${material.unit} from ${inputItem.name}`);
                }
              }

              // Sync updated stock to WooCommerce
              if (run && run.length > 0) {
                await syncInventoryToWooCommerce({
                  productId: run[0].productId,
                  quantity: newStock,
                  productName: product.name,
                  sku: product.sku || undefined,
                });
              }

              console.log(`[Production] Synced ${product.name} stock (${newStock} units) to WooCommerce`);
            }
          } catch (syncError) {
            console.error("[Production] Failed to sync inventory:", syncError);
          }
        }

        return { success: true, message: "Production status updated" };
      } catch (error) {
        console.error("[Production] UpdateStatus error:", error);
        throw error;
      }
    }),
});
