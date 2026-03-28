/**
 * Payment Router - tRPC procedures for payment handling
 * Handles payment tracking, confirmation, and admin dashboard queries
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { sendPaymentDetailsEmail } from "../email";
import { TIER_CONFIG } from "../../shared/tiers";
import {
  getPaymentsByWorkspace,
  getPaymentStats,
  getPaymentById,
  updatePaymentStatus,
  createPayment,
  getWorkspaceWithPayments,
} from "../db";
import { TRPCError } from "@trpc/server";

export const paymentRouter = router({
  /**
   * Send payment details email to customer
   */
  sendPaymentEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        tier: z.enum(["pro", "pro_plus"]),
        reference: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const tierConfig = TIER_CONFIG[input.tier];

      const success = await sendPaymentDetailsEmail({
        email: input.email,
        tier: input.tier,
        tierName: tierConfig.name,
        amount: tierConfig.monthlyPrice,
        reference: input.reference,
        bankDetails: {
          accountHolder: "T Jonker",
          accountNumber: "63198166035",
          bankName: "First National Bank",
          accountType: "Savings Account",
          branchCode: "250155",
        },
      });

      if (!success) {
        throw new Error("Failed to send email");
      }

      return {
        success: true,
        message: "Payment details sent to your email",
      };
    }),

  /**
   * Get all payments for the current workspace (admin only)
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Get workspace for current user
      const workspace = await getWorkspaceWithPayments(ctx.user.id);
      if (!workspace) {
        return [];
      }

      const payments = await getPaymentsByWorkspace(
        workspace.id,
        input.limit,
        input.offset
      );

      return payments.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paystackReference: p.paystackReference,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    }),

  /**
   * Get payment statistics for the current workspace
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const workspace = await getWorkspaceWithPayments(ctx.user.id);
    if (!workspace) {
      return {
        totalCount: 0,
        pendingCount: 0,
        completedCount: 0,
        failedCount: 0,
        totalRevenue: 0,
      };
    }

    const stats = await getPaymentStats(workspace.id);
    return stats || {
      totalCount: 0,
      pendingCount: 0,
      completedCount: 0,
      failedCount: 0,
      totalRevenue: 0,
    };
  }),

  /**
   * Get a single payment by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const payment = await getPaymentById(input.id);
      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
      }

      // Verify ownership
      const workspace = await getWorkspaceWithPayments(ctx.user.id);
      if (!workspace || payment.workspaceId !== workspace.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paystackReference: payment.paystackReference,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };
    }),

  /**
   * Confirm a pending payment (admin only)
   */
  confirm: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Verify user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can confirm payments",
        });
      }

      const payment = await getPaymentById(input.id);
      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
      }

      // Verify ownership
      const workspace = await getWorkspaceWithPayments(ctx.user.id);
      if (!workspace || payment.workspaceId !== workspace.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await updatePaymentStatus(input.id, "completed");

      return {
        success: true,
        message: "Payment confirmed",
      };
    }),

  /**
   * Reject a pending payment (admin only)
   */
  reject: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        reason: z.string().min(1, "Reason is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Verify user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can reject payments",
        });
      }

      const payment = await getPaymentById(input.id);
      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
      }

      // Verify ownership
      const workspace = await getWorkspaceWithPayments(ctx.user.id);
      if (!workspace || payment.workspaceId !== workspace.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await updatePaymentStatus(input.id, "failed");

      return {
        success: true,
        message: "Payment rejected",
      };
    }),

  /**
   * Create a new payment record (for testing or manual entry)
   */
  create: protectedProcedure
    .input(
      z.object({
        amount: z.number().int().min(1),
        paymentMethod: z.string().optional(),
        paystackReference: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const workspace = await getWorkspaceWithPayments(ctx.user.id);
      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
      }

      const result = await createPayment({
        workspaceId: workspace.id,
        amount: input.amount,
        currency: "ZAR",
        status: "pending",
        paymentMethod: input.paymentMethod,
        paystackReference: input.paystackReference,
      });

      return {
        success: true,
        message: "Payment created",
      };
    }),
});
