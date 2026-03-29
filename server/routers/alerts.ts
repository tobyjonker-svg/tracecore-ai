import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const alertsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        isRead: z.boolean().optional(),
        type: z.enum(["low_stock", "expiring_batch", "late_delivery", "quality_issue", "system"]).optional(),
        severity: z.enum(["info", "warning", "critical"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const alerts = await db.getAlerts(workspace.id, input);
        return alerts;
      } catch (error) {
        console.error("[Alerts] List error:", error);
        throw error;
      }
    }),

  getUnread: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

      const unreadAlerts = await db.getUnreadAlerts(workspace.id);
      return unreadAlerts;
    } catch (error) {
      console.error("[Alerts] GetUnread error:", error);
      throw error;
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["low_stock", "expiring_batch", "late_delivery", "quality_issue", "system"]),
        message: z.string().min(1),
        severity: z.enum(["info", "warning", "critical"]).optional(),
        relatedProductId: z.number().optional(),
        relatedBatchId: z.number().optional(),
        relatedSupplierId: z.number().optional(),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const result = await db.createAlert({
          workspaceId: workspace.id,
          ...input,
        });

        return result;
      } catch (error) {
        console.error("[Alerts] Create error:", error);
        throw error;
      }
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        // Verify alert belongs to user's workspace
        const alert = await db.getAlertById(input.id);
        if (!alert || alert.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });
        }

        await db.markAlertAsRead(input.id);
        return { success: true };
      } catch (error) {
        console.error("[Alerts] MarkAsRead error:", error);
        throw error;
      }
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

      await db.markAllAlertsAsRead(workspace.id);
      return { success: true };
    } catch (error) {
      console.error("[Alerts] MarkAllAsRead error:", error);
      throw error;
    }
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        // Verify alert belongs to user's workspace
        const alert = await db.getAlertById(input.id);
        if (!alert || alert.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });
        }

        await db.deleteAlert(input.id);
        return { success: true };
      } catch (error) {
        console.error("[Alerts] Delete error:", error);
        throw error;
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const alert = await db.getAlertById(input.id);
        if (!alert || alert.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });
        }

        return alert;
      } catch (error) {
        console.error("[Alerts] GetById error:", error);
        throw error;
      }
    }),
});
