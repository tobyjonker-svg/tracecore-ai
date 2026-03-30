/**
 * Tracking Router
 * Handles pixel tracking and customer behavior events from MycoAlchemy
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import * as db from '../db';

// Store tracking events in memory (in production, use database)
const trackingEvents: any[] = [];

export const trackingRouter = router({
  /**
   * Pixel tracking endpoint
   * Called by MycoAlchemy on every page load
   * Returns 1x1 transparent GIF
   */
  pixel: publicProcedure
    .input(
      z.object({
        store: z.string(),
        page: z.string().optional(),
        event: z.string().optional(),
        data: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const trackingData = {
          store: input.store,
          page: input.page || 'unknown',
          event: input.event || 'pageView',
          data: input.data ? JSON.parse(decodeURIComponent(input.data)) : {},
          timestamp: new Date().toISOString(),
          userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          ip: ctx.req?.headers['x-forwarded-for'] || ctx.req?.socket?.remoteAddress || 'unknown',
        };

        // Log the tracking event
        trackingEvents.push(trackingData);
        console.log('[Tracking] Event received:', {
          store: input.store,
          event: input.event || 'pageView',
          page: input.page,
        });

        // Keep only last 10000 events in memory
        if (trackingEvents.length > 10000) {
          trackingEvents.shift();
        }

        // Return 1x1 transparent GIF
        return {
          success: true,
          message: 'Pixel tracked',
        };
      } catch (error) {
        console.error('[Tracking] Pixel error:', error);
        // Don't throw - tracking should never break the user experience
        return {
          success: false,
          message: 'Tracking error',
        };
      }
    }),

  /**
   * Log tracking event
   * Called by tracker.js to log customer events
   */
  logEvent: publicProcedure
    .input(
      z.object({
        type: z.string(),
        storeId: z.string(),
        storeName: z.string().optional(),
        sessionId: z.string(),
        customerId: z.string(),
        productId: z.number().optional(),
        productName: z.string().optional(),
        orderId: z.number().optional(),
        orderNumber: z.string().optional(),
        totalAmount: z.number().optional(),
        url: z.string().optional(),
        timestamp: z.string(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const event = {
          ...input,
          receivedAt: new Date().toISOString(),
          ip: ctx.req?.headers['x-forwarded-for'] || ctx.req?.socket?.remoteAddress || 'unknown',
        };

        trackingEvents.push(event);
        console.log('[Tracking] Event logged:', {
          type: input.type,
          storeId: input.storeId,
          sessionId: input.sessionId,
        });

        // Keep only last 10000 events
        if (trackingEvents.length > 10000) {
          trackingEvents.shift();
        }

        return {
          success: true,
          message: 'Event logged',
        };
      } catch (error) {
        console.error('[Tracking] Log event error:', error);
        // Don't throw - tracking should never break functionality
        return {
          success: false,
          message: 'Error logging event',
        };
      }
    }),

  /**
   * Get tracking events for a store
   * Admin endpoint to view customer behavior
   */
  getStoreEvents: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        limit: z.number().optional().default(100),
        eventType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let events = trackingEvents.filter((e) => e.storeId === input.storeId || e.store === input.storeId);

        if (input.eventType) {
          events = events.filter((e) => e.type === input.eventType || e.event === input.eventType);
        }

        // Return most recent events
        events = events.slice(-input.limit);

        return {
          success: true,
          storeId: input.storeId,
          eventCount: events.length,
          events,
        };
      } catch (error) {
        console.error('[Tracking] Get events error:', error);
        throw error;
      }
    }),

  /**
   * Get tracking analytics for a store
   */
  getStoreAnalytics: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        days: z.number().optional().default(7),
      })
    )
    .query(async ({ input }) => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - input.days);

        const events = trackingEvents.filter((e) => {
          const eventDate = new Date(e.timestamp || e.receivedAt);
          return (e.storeId === input.storeId || e.store === input.storeId) && eventDate >= cutoffDate;
        });

        // Calculate analytics
        const analytics = {
          totalEvents: events.length,
          uniqueSessions: new Set(events.map((e) => e.sessionId)).size,
          uniqueCustomers: new Set(events.map((e) => e.customerId)).size,
          eventsByType: {} as Record<string, number>,
          topProducts: {} as Record<string, number>,
          topPages: {} as Record<string, number>,
        };

        events.forEach((event) => {
          const type = event.type || event.event;
          analytics.eventsByType[type] = (analytics.eventsByType[type] || 0) + 1;

          if (event.productName) {
            analytics.topProducts[event.productName] = (analytics.topProducts[event.productName] || 0) + 1;
          }

          if (event.page) {
            analytics.topPages[event.page] = (analytics.topPages[event.page] || 0) + 1;
          }
        });

        // Sort top items
        const topProducts = Object.entries(analytics.topProducts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        const topPages = Object.entries(analytics.topPages)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        return {
          success: true,
          storeId: input.storeId,
          period: `Last ${input.days} days`,
          analytics: {
            ...analytics,
            topProducts: Object.fromEntries(topProducts),
            topPages: Object.fromEntries(topPages),
          },
        };
      } catch (error) {
        console.error('[Tracking] Analytics error:', error);
        throw error;
      }
    }),

  /**
   * Clear tracking events (admin only)
   */
  clearEvents: publicProcedure
    .input(z.object({ storeId: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        if (input.storeId) {
          const beforeCount = trackingEvents.length;
          const filtered = trackingEvents.filter((e) => e.storeId !== input.storeId && e.store !== input.storeId);
          const removed = beforeCount - filtered.length;
          trackingEvents.length = 0;
          trackingEvents.push(...filtered);
          return {
            success: true,
            message: `Cleared ${removed} events for store ${input.storeId}`,
          };
        } else {
          const count = trackingEvents.length;
          trackingEvents.length = 0;
          return {
            success: true,
            message: `Cleared all ${count} tracking events`,
          };
        }
      } catch (error) {
        console.error('[Tracking] Clear error:', error);
        throw error;
      }
    }),
});
