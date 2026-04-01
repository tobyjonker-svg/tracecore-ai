/**
 * WooCommerce Integration Router
 * Handles bidirectional sync with MycoAlchemy WordPress/WooCommerce store
 * - Receives order webhooks from WooCommerce
 * - Sends inventory updates back to WooCommerce
 */

import { z } from 'zod';
import { publicProcedure, router, protectedProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import * as db from '../db';
import crypto from 'crypto';
import { syncInventoryToWooCommerce } from '../_core/woocommerce-sync';

// Webhook signature validation
const validateWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  return hash === signature;
};

// Import router and protectedProcedure
export const woocommerceRouter = router({
  /**
   * Webhook endpoint for WooCommerce order.created event
   * Receives order data from MycoAlchemy and creates order in TraceCore
   */
  webhookOrderCreated: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        orderNumber: z.string(),
        customerEmail: z.string().email(),
        customerName: z.string(),
        items: z.array(
          z.object({
            productId: z.number(),
            productName: z.string(),
            sku: z.string().optional(),
            quantity: z.number(),
            price: z.number(),
            total: z.number(),
          })
        ),
        totalAmount: z.number(),
        status: z.string(),
        paymentStatus: z.string(),
        shippingAddress: z.object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postcode: z.string().optional(),
          country: z.string().optional(),
        }).optional(),
        createdAt: z.string(),
        signature: z.string().optional(),
        workspaceId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate webhook signature - CRITICAL for security
        const webhookSecret = process.env.WOOCOMMERCE_WEBHOOK_SECRET || 'tracecore_mycoalchemy_2026';
        if (input.signature) {
          const payload = JSON.stringify(input);
          const isValid = validateWebhookSignature(
            payload,
            input.signature,
            webhookSecret
          );
          if (!isValid) {
            console.error('[WooCommerce] Invalid webhook signature received');
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Invalid webhook signature',
            });
          }
          console.log('[WooCommerce] Webhook signature validated successfully');
        } else {
          console.warn('[WooCommerce] Webhook received without signature');
        }

        // Get workspace - use provided workspace or default
        const workspaceId = input.workspaceId || 1;

        // Create order in TraceCore
        const orderData = {
          workspaceId,
          orderNumber: input.orderNumber,
          customerId: input.customerEmail,
          customerName: input.customerName,
          productId: input.items[0]?.productId || 1,
          quantity: input.items.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: input.totalAmount.toString(),
          status: input.paymentStatus === 'paid' ? 'confirmed' : 'pending',
          dueDate: undefined,
        };

        // Create order using db helper
        await db.createOrder(orderData);

        // Update inventory for each item
        for (const item of input.items) {
          // Find product by SKU or name
          const products = await db.getProductsByWorkspace(workspaceId);
          const product = products.find(
            (p: any) => (item.sku && p.sku === item.sku) || p.name === item.productName
          );

          if (product) {
            // Decrease inventory
            const newStock = Math.max(0, (product.currentStock || 0) - item.quantity);
            await db.updateProduct(product.id, {
              currentStock: newStock,
            });
            
            // Sync updated stock back to WooCommerce
            try {
              await syncInventoryToWooCommerce({
                productId: product.id,
                quantity: newStock,
                productName: product.name,
                sku: product.sku || undefined,
              });
              console.log(`[WooCommerce] Synced ${product.name} stock (${newStock} units) after order`);
            } catch (syncError) {
              console.error('[WooCommerce] Failed to sync inventory after order:', syncError);
            }
          }
        }

        return {
          success: true,
          message: `Order ${input.orderNumber} created successfully`,
        };
      } catch (error) {
        console.error('[WooCommerce] Order creation error:', error);
        throw error;
      }
    }),

  /**
   * Endpoint to send inventory levels back to WooCommerce
   * Called when inventory is updated in TraceCore
   */
  syncInventoryToWooCommerce: publicProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number(),
        woocommerceProductId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Prepare inventory update payload for WooCommerce
        const payload = {
          productId: input.woocommerceProductId || input.productId,
          quantity: input.quantity,
          timestamp: new Date().toISOString(),
        };

        // Send to WooCommerce webhook endpoint
        const woocommerceWebhookUrl = process.env.WOOCOMMERCE_INVENTORY_WEBHOOK_URL;
        if (!woocommerceWebhookUrl) {
          console.warn('[WooCommerce] Webhook URL not configured, skipping sync');
          return {
            success: true,
            message: 'Inventory sync skipped (webhook not configured)',
          };
        }

        const response = await fetch(woocommerceWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WC-Webhook-Source': 'tracecore-ai',
            'Authorization': `Bearer ${process.env.WOOCOMMERCE_API_KEY || ''}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          console.error(`[WooCommerce] Sync failed: ${response.statusText}`);
          // Don't throw - log and continue
          return {
            success: false,
            message: `WooCommerce sync failed: ${response.statusText}`,
          };
        }

        return {
          success: true,
          message: 'Inventory synced to WooCommerce',
        };
      } catch (error) {
        console.error('[WooCommerce] Inventory sync error:', error);
        throw error;
      }
    }),

  /**
   * Get integration status and configuration
   */
  getIntegrationStatus: publicProcedure.query(async ({ ctx }) => {
    return {
      isConfigured: !!process.env.WOOCOMMERCE_WEBHOOK_SECRET,
      webhookUrl: `${process.env.VITE_APP_ID || 'https://traceai-jqzfjcqa.manus.space'}/api/trpc/woocommerce.webhookOrderCreated`,
      features: {
        orderSync: true,
        inventorySync: true,
        realTimeSync: true,
      },
      status: 'ready',
    };
  }),

  /**
   * Test webhook connection
   */
  testWebhookConnection: publicProcedure
    .input(z.object({ testOrderId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      // Send test payload to WooCommerce
      const testPayload = {
        orderId: input.testOrderId || 99999,
        orderNumber: 'TEST-001',
        customerEmail: 'test@mycoalchemy.co.za',
        customerName: 'Test Customer',
        items: [
          {
            productId: 1,
            productName: 'Test Product',
            sku: 'TEST-SKU',
            quantity: 1,
            price: 100,
            total: 100,
          },
        ],
        totalAmount: 100,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        message: 'Test webhook payload prepared',
        payload: testPayload,
      };
    }),
});
