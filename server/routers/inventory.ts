import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const inventoryRouter = router({
  // List all inventory activities for a workspace
  list: protectedProcedure
    .input(
      z.object({
        type: z.enum(["purchase", "sale", "adjustment", "production", "return"]).optional(),
        productId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const activities = await db.getInventoryActivities(
          workspace.id,
          input.type,
          input.productId,
          input.startDate,
          input.endDate
        );

        return activities;
      } catch (error) {
        console.error("[Inventory] List error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Create inventory activity
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        type: z.enum(["purchase", "sale", "adjustment", "production", "return"]),
        quantity: z.number().positive(),
        costPerUnit: z.string().optional(),
        sellingPrice: z.string().optional(),
        supplierId: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        // Verify product exists and belongs to workspace
        const productData = await db.getProductById(input.productId);
        const product = Array.isArray(productData) ? productData[0] : productData;
        if (!product || product.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }

        const activity = await db.createInventoryActivity({
          workspaceId: workspace.id,
          productId: input.productId,
          type: input.type,
          quantity: input.quantity,
          costPerUnit: input.costPerUnit ? parseFloat(input.costPerUnit) : undefined,
          sellingPrice: input.sellingPrice ? parseFloat(input.sellingPrice) : undefined,
          supplierId: input.supplierId,
          notes: input.notes,
        });

        return activity;
      } catch (error) {
        console.error("[Inventory] Create error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get activity by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const activity = await db.getInventoryActivityById(input.id);
        if (!activity || activity.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
        }

        return activity;
      } catch (error) {
        console.error("[Inventory] GetById error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Delete inventory activity
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const activity = await db.getInventoryActivityById(input.id);
        if (!activity || activity.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
        }

        await db.deleteInventoryActivity(input.id);
        return { success: true };
      } catch (error) {
        console.error("[Inventory] Delete error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get activity summary/analytics
  getSummary: protectedProcedure
    .input(
      z.object({
        type: z.enum(["purchase", "sale", "adjustment", "production", "return"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const summary = await db.getInventoryActivitySummary(
          workspace.id,
          input.type,
          input.startDate,
          input.endDate
        );

        return summary;
      } catch (error) {
        console.error("[Inventory] GetSummary error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
