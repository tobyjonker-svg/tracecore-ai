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
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        return await db.createProductionRun({
          workspaceId: workspace.id,
          ...input,
        });
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

        // When production is completed or approved, add to inventory and sync to WooCommerce
        if (input.status === "completed" || input.status === "approved") {
          try {
            // Get the product being produced
            const products = await db.getProductById(run.productId);
            if (products.length > 0) {
              const product = products[0];
              const newStock = (product.currentStock || 0) + run.quantity;
              
              // Update product stock in TraceCore
              await db.updateProduct(run.productId, { currentStock: newStock });
              
              // Sync updated stock to WooCommerce
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
            // Don't throw - production update succeeded, sync is secondary
          }
        }

        return { success: true, message: "Production status updated" };
      } catch (error) {
        console.error("[Production] UpdateStatus error:", error);
        throw error;
      }
    }),
});

