import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const batchesRouter = router({
  // List all batch lots for a workspace
  list: protectedProcedure
    .input(
      z.object({
        productId: z.number().optional(),
        inputId: z.number().optional(),
        qualityStatus: z.enum(["pending", "approved", "rejected", "expired"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const batches = await db.getBatchLots(workspace.id, {
          productId: input.productId,
          inputId: input.inputId,
          qualityStatus: input.qualityStatus,
        });

        return batches;
      } catch (error) {
        console.error("[Batches] List error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Create batch lot
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number().optional(),
        inputId: z.number().optional(),
        batchNumber: z.string().min(1),
        quantity: z.string().or(z.number()),
        unit: z.string().optional(),
        manufacturedDate: z.date().optional(),
        expiryDate: z.date().optional(),
        qualityStatus: z.enum(["pending", "approved", "rejected", "expired"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const batch = await db.createBatchLot({
          workspaceId: workspace.id,
          productId: input.productId,
          inputId: input.inputId,
          batchNumber: input.batchNumber,
          quantity: input.quantity,
          unit: input.unit,
          manufacturedDate: input.manufacturedDate,
          expiryDate: input.expiryDate,
          qualityStatus: input.qualityStatus,
          notes: input.notes,
        });

        return batch;
      } catch (error) {
        console.error("[Batches] Create error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get batch by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const batch = await db.getBatchLotById(input.id);
        if (!batch || batch.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Batch not found" });
        }

        return batch;
      } catch (error) {
        console.error("[Batches] GetById error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Update batch lot
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        batchNumber: z.string().optional(),
        quantity: z.string().or(z.number()).optional(),
        unit: z.string().optional(),
        manufacturedDate: z.date().optional(),
        expiryDate: z.date().optional(),
        qualityStatus: z.enum(["pending", "approved", "rejected", "expired"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const batch = await db.getBatchLotById(input.id);
        if (!batch || batch.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Batch not found" });
        }

        const updated = await db.updateBatchLot(input.id, {
          batchNumber: input.batchNumber,
          quantity: input.quantity,
          unit: input.unit,
          manufacturedDate: input.manufacturedDate,
          expiryDate: input.expiryDate,
          qualityStatus: input.qualityStatus,
          notes: input.notes,
        });

        return updated;
      } catch (error) {
        console.error("[Batches] Update error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Delete batch lot
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const batch = await db.getBatchLotById(input.id);
        if (!batch || batch.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Batch not found" });
        }

        await db.deleteBatchLot(input.id);
        return { success: true };
      } catch (error) {
        console.error("[Batches] Delete error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get expiring batches
  getExpiring: protectedProcedure
    .input(z.object({ daysUntilExpiry: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const expiring = await db.getExpiringBatches(workspace.id, input.daysUntilExpiry || 30);
        return expiring;
      } catch (error) {
        console.error("[Batches] GetExpiring error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
