import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const suppliersRouter = router({
  // List all suppliers for a workspace
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
      }

      const suppliers = await db.getSuppliers(workspace.id);
      return suppliers;
    } catch (error) {
      console.error("[Suppliers] List error:", error);
      throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  // Create supplier
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const supplier = await db.createSupplier({
          workspaceId: workspace.id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          city: input.city,
          country: input.country,
          notes: input.notes,
        });

        return supplier;
      } catch (error) {
        console.error("[Suppliers] Create error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get supplier by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const supplier = await db.getSupplierById(input.id);
        if (!supplier || supplier.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Supplier not found" });
        }

        return supplier;
      } catch (error) {
        console.error("[Suppliers] GetById error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Update supplier
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const supplier = await db.getSupplierById(input.id);
        if (!supplier || supplier.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Supplier not found" });
        }

        const updated = await db.updateSupplier(input.id, {
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          city: input.city,
          country: input.country,
          notes: input.notes,
        });

        return updated;
      } catch (error) {
        console.error("[Suppliers] Update error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Delete supplier
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const supplier = await db.getSupplierById(input.id);
        if (!supplier || supplier.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Supplier not found" });
        }

        await db.deleteSupplier(input.id);
        return { success: true };
      } catch (error) {
        console.error("[Suppliers] Delete error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Add pricing history
  addPricingHistory: protectedProcedure
    .input(
      z.object({
        supplierId: z.number(),
        inputId: z.number(),
        price: z.string().or(z.number()),
        unit: z.string().optional(),
        effectiveDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const supplier = await db.getSupplierById(input.supplierId);
        if (!supplier || supplier.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Supplier not found" });
        }

        const pricing = await db.addPricingHistory({
          workspaceId: workspace.id,
          supplierId: input.supplierId,
          inputId: input.inputId,
          price: input.price,
          unit: input.unit,
          effectiveDate: input.effectiveDate,
          notes: input.notes,
        });

        return pricing;
      } catch (error) {
        console.error("[Suppliers] AddPricingHistory error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get pricing history
  getPricingHistory: protectedProcedure
    .input(
      z.object({
        supplierId: z.number().optional(),
        inputId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const pricing = await db.getPricingHistory(workspace.id, input.supplierId, input.inputId);
        return pricing;
      } catch (error) {
        console.error("[Suppliers] GetPricingHistory error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get supplier performance
  getPerformance: protectedProcedure
    .input(z.object({ supplierId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const supplier = await db.getSupplierById(input.supplierId);
        if (!supplier || supplier.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Supplier not found" });
        }

        const performance = await db.getSupplierPerformance(workspace.id, input.supplierId);
        return performance;
      } catch (error) {
        console.error("[Suppliers] GetPerformance error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get all supplier performance metrics
  getAllPerformance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
      }

      const performance = await db.getAllSupplierPerformance(workspace.id);
      return performance;
    } catch (error) {
      console.error("[Suppliers] GetAllPerformance error:", error);
      throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  // Update supplier performance
  updatePerformance: protectedProcedure
    .input(
      z.object({
        supplierId: z.number(),
        totalOrders: z.number().optional(),
        onTimeDeliveries: z.number().optional(),
        lateDeliveries: z.number().optional(),
        qualityIssues: z.number().optional(),
        averageRating: z.string().or(z.number()).optional(),
        lastOrderDate: z.date().optional(),
        totalSpent: z.string().or(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No workspace found" });
        }

        const supplier = await db.getSupplierById(input.supplierId);
        if (!supplier || supplier.workspaceId !== workspace.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Supplier not found" });
        }

        const updated = await db.updateSupplierPerformance(workspace.id, input.supplierId, {
          totalOrders: input.totalOrders,
          onTimeDeliveries: input.onTimeDeliveries,
          lateDeliveries: input.lateDeliveries,
          qualityIssues: input.qualityIssues,
          averageRating: input.averageRating,
          lastOrderDate: input.lastOrderDate,
          totalSpent: input.totalSpent,
        });

        return updated;
      } catch (error) {
        console.error("[Suppliers] UpdatePerformance error:", error);
        throw error instanceof TRPCError ? error : new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
