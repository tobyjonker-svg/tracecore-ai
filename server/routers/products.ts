/**
 * Products Router - Cost & Margin Tracking
 * Procedures for managing products with cost per unit, selling price, and profit margin calculations
 */

import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createProduct,
  getProductsByWorkspace,
  getProductById,
  updateProduct,
  deleteProduct,
  getInventoryValuation,
  getWorkspaceWithPayments,
} from "../db";
import { z } from "zod";

// Validation schemas
const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().optional(),
  sku: z.string().max(100).optional(),
  costPerUnit: z.number().positive("Cost per unit must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
  currentStock: z.number().int().nonnegative("Stock must be non-negative").default(0),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  unit: z.string().max(50).default("units"),
});

const UpdateProductSchema = CreateProductSchema.partial();

export const productsRouter = router({
  /**
   * Create a new product with cost and selling price
   */
  create: protectedProcedure
    .input(CreateProductSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        // Get user's workspace
        const workspace = await getWorkspaceWithPayments(ctx.user.id);
        if (!workspace?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No active workspace",
          });
        }

        const result = await createProduct({
          workspaceId: workspace.id,
          name: input.name,
          description: input.description,
          sku: input.sku,
          costPerUnit: input.costPerUnit.toString(),
          sellingPrice: input.sellingPrice.toString(),
          currentStock: input.currentStock,
          lowStockThreshold: input.lowStockThreshold,
          unit: input.unit,
        });

        return {
          success: true,
          message: "Product created successfully",
        };
      } catch (error) {
        console.error("[Products] Create error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
        });
      }
    }),

  /**
   * Get all products for the workspace
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const workspace = await getWorkspaceWithPayments(ctx.user.id);
      if (!workspace?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No active workspace",
        });
      }

      const products = await getProductsByWorkspace(workspace.id);

      return products.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        sku: p.sku,
        costPerUnit: parseFloat(p.costPerUnit.toString()),
        sellingPrice: parseFloat(p.sellingPrice.toString()),
        currentStock: p.currentStock,
        lowStockThreshold: p.lowStockThreshold,
        unit: p.unit,
        profitPerUnit: parseFloat(p.sellingPrice.toString()) - parseFloat(p.costPerUnit.toString()),
        profitMarginPercent: (
          ((parseFloat(p.sellingPrice.toString()) - parseFloat(p.costPerUnit.toString())) /
            parseFloat(p.sellingPrice.toString())) *
          100
        ).toFixed(2),
        totalCostValue: p.currentStock * parseFloat(p.costPerUnit.toString()),
        totalSellingValue: p.currentStock * parseFloat(p.sellingPrice.toString()),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    } catch (error) {
      console.error("[Products] List error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch products",
      });
    }
  }),

  /**
   * Get a single product by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        const workspace = await getWorkspaceWithPayments(ctx.user.id);
        if (!workspace?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No active workspace",
          });
        }

        const result = await getProductById(input.id);
        if (!result || result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const p = result[0];
        if (p.workspaceId !== workspace.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot access this product",
          });
        }

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          sku: p.sku,
          costPerUnit: parseFloat(p.costPerUnit.toString()),
          sellingPrice: parseFloat(p.sellingPrice.toString()),
          currentStock: p.currentStock,
          lowStockThreshold: p.lowStockThreshold,
          unit: p.unit,
          profitPerUnit: parseFloat(p.sellingPrice.toString()) - parseFloat(p.costPerUnit.toString()),
          profitMarginPercent: (
            ((parseFloat(p.sellingPrice.toString()) - parseFloat(p.costPerUnit.toString())) /
              parseFloat(p.sellingPrice.toString())) *
            100
          ).toFixed(2),
          totalCostValue: p.currentStock * parseFloat(p.costPerUnit.toString()),
          totalSellingValue: p.currentStock * parseFloat(p.sellingPrice.toString()),
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      } catch (error) {
        console.error("[Products] GetById error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch product",
        });
      }
    }),

  /**
   * Update a product
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: UpdateProductSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        const workspace = await getWorkspaceWithPayments(ctx.user.id);
        if (!workspace?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No active workspace",
          });
        }

        // Verify product belongs to workspace
        const existing = await getProductById(input.id);
        if (!existing || existing.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        if (existing[0].workspaceId !== workspace.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot update this product",
          });
        }

        const updateData: any = {};
        if (input.data.name !== undefined) updateData.name = input.data.name;
        if (input.data.description !== undefined) updateData.description = input.data.description;
        if (input.data.sku !== undefined) updateData.sku = input.data.sku;
        if (input.data.costPerUnit !== undefined) updateData.costPerUnit = input.data.costPerUnit.toString();
        if (input.data.sellingPrice !== undefined) updateData.sellingPrice = input.data.sellingPrice.toString();
        if (input.data.currentStock !== undefined) updateData.currentStock = input.data.currentStock;
        if (input.data.lowStockThreshold !== undefined) updateData.lowStockThreshold = input.data.lowStockThreshold;
        if (input.data.unit !== undefined) updateData.unit = input.data.unit;

        await updateProduct(input.id, updateData);

        return {
          success: true,
          message: "Product updated successfully",
        };
      } catch (error) {
        console.error("[Products] Update error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product",
        });
      }
    }),

  /**
   * Delete a product
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        const workspace = await getWorkspaceWithPayments(ctx.user.id);
        if (!workspace?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No active workspace",
          });
        }

        // Verify product belongs to workspace
        const existing = await getProductById(input.id);
        if (!existing || existing.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        if (existing[0].workspaceId !== workspace.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot delete this product",
          });
        }

        await deleteProduct(input.id);

        return {
          success: true,
          message: "Product deleted successfully",
        };
      } catch (error) {
        console.error("[Products] Delete error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete product",
        });
      }
    }),

  /**
   * Get inventory valuation summary (total cost value, selling value, profit potential)
   */
  getValuation: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const workspace = await getWorkspaceWithPayments(ctx.user.id);
      if (!workspace?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No active workspace",
        });
      }

      const valuation = await getInventoryValuation(workspace.id);

      // Calculate totals
      let totalCostValue = 0;
      let totalSellingValue = 0;
      let totalProfitPotential = 0;

      valuation.forEach((item: any) => {
        totalCostValue += item.totalCostValue;
        totalSellingValue += item.totalSellingValue;
        totalProfitPotential += item.totalSellingValue - item.totalCostValue;
      });

      const overallMarginPercent =
        totalSellingValue > 0
          ? ((totalProfitPotential / totalSellingValue) * 100).toFixed(2)
          : "0.00";

      return {
        products: valuation,
        summary: {
          totalCostValue: parseFloat(totalCostValue.toFixed(2)),
          totalSellingValue: parseFloat(totalSellingValue.toFixed(2)),
          totalProfitPotential: parseFloat(totalProfitPotential.toFixed(2)),
          overallMarginPercent: parseFloat(overallMarginPercent),
          productCount: valuation.length,
        },
      };
    } catch (error) {
      console.error("[Products] GetValuation error:", error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch valuation",
      });
    }
  }),
});
