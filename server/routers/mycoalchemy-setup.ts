import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

/**
 * MycoAlchemy integration setup router
 * Handles importing products and configuring WooCommerce integration
 */

const MYCOALCHEMY_PRODUCTS = [
  {
    name: "Lion's Mane Dual Extract Tincture 1:3 – 50ml",
    sku: "MYC-LM-50",
    woocommerceId: 40,
    costPerUnit: 150.00,
    sellingPrice: 289.00,
    currentStock: 50,
  },
  {
    name: "Turkey Tail Dual Extract Tincture 1:3 – 50ml",
    sku: "MYC-TT-50",
    woocommerceId: 41,
    costPerUnit: 150.00,
    sellingPrice: 289.00,
    currentStock: 50,
  },
  {
    name: "Reishi Dual Extract Tincture 1:3 – 50ml",
    sku: "MYC-REI-50",
    woocommerceId: 214,
    costPerUnit: 150.00,
    sellingPrice: 289.00,
    currentStock: 50,
  },
  {
    name: "Cordyceps Dual Extract Tincture 1:3 – 50ml",
    sku: "MYC-COR-50",
    woocommerceId: 216,
    costPerUnit: 150.00,
    sellingPrice: 289.00,
    currentStock: 50,
  },
  {
    name: "Full Spectrum Mushroom Blend Tincture 1:3 – 50ml",
    sku: "MYC-BLD-50",
    woocommerceId: 310,
    costPerUnit: 250.00,
    sellingPrice: 399.00,
    currentStock: 30,
  },
];

export const mycoalchemySetupRouter = router({
  /**
   * Import all MycoAlchemy products into the workspace
   * Only admins can run this
   */
  importProducts: adminProcedure.mutation(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
      }

      const imported = [];
      const skipped = [];
      const errors = [];

      for (const product of MYCOALCHEMY_PRODUCTS) {
        try {
          // Check if product already exists by SKU
          const existing = await db.getProductsByWorkspace(workspace.id);
          const productExists = existing.some((p) => p.sku === product.sku);

          if (productExists) {
            skipped.push(product.sku);
            continue;
          }

          // Create product
          await db.createProduct({
            workspaceId: workspace.id,
            name: product.name,
            sku: product.sku,
            costPerUnit: product.costPerUnit.toString(),
            sellingPrice: product.sellingPrice.toString(),
            currentStock: product.currentStock,
            unit: "units",
            lowStockThreshold: 10,
          });

          imported.push(product.sku);
          console.log(`[MycoAlchemy] Imported product: ${product.sku}`);
        } catch (error) {
          errors.push({
            sku: product.sku,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          console.error(`[MycoAlchemy] Failed to import ${product.sku}:`, error);
        }
      }

      return {
        success: true,
        imported,
        skipped,
        errors,
        message: `Imported ${imported.length} products, skipped ${skipped.length}`,
      };
    } catch (error) {
      console.error("[MycoAlchemy] Import error:", error);
      throw error;
    }
  }),

  /**
   * Get all MycoAlchemy products in the workspace
   */
  getProducts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
      }

      const products = await db.getProductsByWorkspace(workspace.id);
      const mycoalchemyProducts = products.filter((p) =>
        MYCOALCHEMY_PRODUCTS.some((mp) => mp.sku === p.sku)
      );

      return mycoalchemyProducts;
    } catch (error) {
      console.error("[MycoAlchemy] Get products error:", error);
      throw error;
    }
  }),

  /**
   * Get product by SKU for WooCommerce sync
   */
  getProductBySku: protectedProcedure
    .input(z.object({ sku: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
        }

        const products = await db.getProductsByWorkspace(workspace.id);
        const product = products.find((p) => p.sku === input.sku);

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product with SKU ${input.sku} not found`,
          });
        }

        return product;
      } catch (error) {
        console.error("[MycoAlchemy] Get product by SKU error:", error);
        throw error;
      }
    }),
});
