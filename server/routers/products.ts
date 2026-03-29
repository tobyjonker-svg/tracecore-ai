/**
 * Products Router - Cost & Margin Tracking
 * Procedures for managing products with cost per unit, selling price, and profit margin calculations
 */

import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getProductsByWorkspace,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventoryValuation,
  getWorkspaceByUserId,
} from "../db";
import { z } from "zod";

// Validation schemas
const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().optional(),
  sku: z.string().max(100).optional(),
  inputId: z.number().int().positive().optional(), // Link to raw material
  conversionRatio: z.number().positive("Conversion ratio must be positive").optional(), // e.g., 1kg makes 100 capsules
  costPerUnit: z.number().positive("Cost per unit must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
  currentStock: z.number().int().nonnegative("Stock must be non-negative").default(0),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  unit: z.string().max(50).default("units"),
});

const UpdateProductSchema = CreateProductSchema.partial();

const GetByIdSchema = z.object({
  id: z.number().int().positive(),
});

const DeleteSchema = z.object({
  id: z.number().int().positive(),
});

export const productsRouter = router({
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
        const workspace = await getWorkspaceByUserId(ctx.user.id);
        if (!workspace?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No active workspace",
          });
        }

        await createProduct({
          workspaceId: workspace.id,
          name: input.name,
          description: input.description,
          sku: input.sku,
          inputId: input.inputId,
          conversionRatio: input.conversionRatio?.toString(),
          costPerUnit: input.costPerUnit.toString(),
          sellingPrice: input.sellingPrice.toString(),
          currentStock: input.currentStock,
          lowStockThreshold: input.lowStockThreshold,
          unit: input.unit,
        });

        return { success: true };
      } catch (error) {
        console.error("[Products] Create error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
        });
      }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const workspace = await getWorkspaceByUserId(ctx.user.id);
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
        inputId: p.inputId,
        conversionRatio: p.conversionRatio ? parseFloat(p.conversionRatio.toString()) : undefined,
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

  getById: protectedProcedure
    .input(GetByIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        const workspace = await getWorkspaceByUserId(ctx.user.id);
        if (!workspace?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No active workspace",
          });
        }

        const products = await getProductById(input.id);
        if (products.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const p = products[0];
        if (p.workspaceId !== workspace.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
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

  update: protectedProcedure
    .input(z.object({ id: z.number().int().positive(), data: UpdateProductSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        const workspace = await getWorkspaceByUserId(ctx.user.id);
        if (!workspace?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No active workspace",
          });
        }

        const products = await getProductById(input.id);
        if (products.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        if (products[0].workspaceId !== workspace.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
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

        return { success: true };
      } catch (error) {
        console.error("[Products] Update error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product",
        });
      }
    }),

  delete: protectedProcedure
    .input(DeleteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        const workspace = await getWorkspaceByUserId(ctx.user.id);
        if (!workspace?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No active workspace",
          });
        }

        const products = await getProductById(input.id);
        if (products.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        if (products[0].workspaceId !== workspace.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        await deleteProduct(input.id);

        return { success: true };
      } catch (error) {
        console.error("[Products] Delete error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete product",
        });
      }
    }),

  getValuation: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const workspace = await getWorkspaceByUserId(ctx.user.id);
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
