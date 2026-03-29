import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const shipmentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

      return await db.getShipments(workspace.id);
    } catch (error) {
      console.error("[Shipments] List error:", error);
      throw error;
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        trackingNumber: z.string().optional(),
        carrier: z.string().optional(),
        estimatedDelivery: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        return await db.createShipment({
          workspaceId: workspace.id,
          ...input,
        });
      } catch (error) {
        console.error("[Shipments] Create error:", error);
        throw error;
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        orderId: z.number().optional(),
        trackingNumber: z.string().optional(),
        carrier: z.string().optional(),
        status: z.enum(["pending", "picked", "packed", "shipped", "in_transit", "delivered"]).optional(),
        estimatedDelivery: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const shipment = await db.getShipmentById(input.id);
        if (!shipment || shipment.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Shipment not found" });
        }

        return await db.updateShipment(input.id, input);
      } catch (error) {
        console.error("[Shipments] Update error:", error);
        throw error;
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const shipment = await db.getShipmentById(input.id);
        if (!shipment || shipment.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Shipment not found" });
        }

        await db.deleteShipment(input.id);
        return { success: true };
      } catch (error) {
        console.error("[Shipments] Delete error:", error);
        throw error;
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const shipment = await db.getShipmentById(input.id);
        if (!shipment || shipment.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Shipment not found" });
        }

        return shipment;
      } catch (error) {
        console.error("[Shipments] GetById error:", error);
        throw error;
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["pending", "picked", "packed", "shipped", "in_transit", "delivered"]) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const shipment = await db.getShipmentById(input.id);
        if (!shipment || shipment.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Shipment not found" });
        }

        return await db.updateShipment(input.id, { status: input.status });
      } catch (error) {
        console.error("[Shipments] UpdateStatus error:", error);
        throw error;
      }
    }),
});
