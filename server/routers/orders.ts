import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { updateWooCommerceOrderStatus } from "../_core/woocommerce-sync";

// Map TraceCore status to WooCommerce status
const toWcStatus: Record<string, string> = {
  pending: "pending",
  processing: "processing",
  shipped: "on-hold",
  delivered: "completed",
  cancelled: "cancelled",
};

export const ordersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

      return await db.getOrders(workspace.id);
    } catch (error) {
      console.error("[Orders] List error:", error);
      throw error;
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        orderNumber: z.string().min(1),
        customerId: z.string().min(1),
        customerName: z.string().min(1),
        productId: z.number(),
        quantity: z.number().min(1),
        totalPrice: z.string(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        return await db.createOrder({
          workspaceId: workspace.id,
          ...input,
          totalPrice: input.totalPrice,
        });
      } catch (error) {
        console.error("[Orders] Create error:", error);
        throw error;
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        orderNumber: z.string().optional(),
        customerId: z.string().optional(),
        customerName: z.string().optional(),
        productId: z.number().optional(),
        quantity: z.number().optional(),
        totalPrice: z.string().optional(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const order = await db.getOrderById(input.id);
        if (!order || order.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        await db.updateOrder(input.id, input);
        // Sync status to WooCommerce if status changed
        if (input.status) {
          try {
            const wcStatus = toWcStatus[input.status] || "pending";
            await updateWooCommerceOrderStatus(parseInt(order.orderNumber), wcStatus);
            console.log("[Orders] Synced order", order.orderNumber, "to WooCommerce:", wcStatus);
          } catch (wcError) {
            console.error("[Orders] WC sync failed:", wcError);
          }
        }
        return { success: true };
      } catch (error) {
        console.error("[Orders] Update error:", error);
        throw error;
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const order = await db.getOrderById(input.id);
        if (!order || order.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        await db.deleteOrder(input.id);
        return { success: true };
      } catch (error) {
        console.error("[Orders] Delete error:", error);
        throw error;
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const order = await db.getOrderById(input.id);
        if (!order || order.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        return order;
      } catch (error) {
        console.error("[Orders] GetById error:", error);
        throw error;
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const order = await db.getOrderById(input.id);
        if (!order || order.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        await db.updateOrder(input.id, { status: input.status });
        // Sync status to WooCommerce
        try {
          const wcStatus = toWcStatus[input.status] || "pending";
          await updateWooCommerceOrderStatus(parseInt(order.orderNumber), wcStatus);
          console.log("[Orders] Synced order", order.orderNumber, "to WooCommerce status:", wcStatus);
        } catch (wcError) {
          console.error("[Orders] Failed to sync status to WooCommerce:", wcError);
        }
        return { success: true };
      } catch (error) {
        console.error("[Orders] UpdateStatus error:", error);
        throw error;
      }
    }),

  // Also sync when using the general update mutation
});
