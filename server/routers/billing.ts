/**
 * TraceCore AI — Billing Router
 * Handles subscription management and payments
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { initializePayment, verifyPayment } from '../paystack';
import { getDb } from '../db';
import { payments, subscriptions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const billingRouter = router({
  /**
   * Initialize a payment for subscription upgrade
   */
  initializePayment: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        tier: z.enum(['pro', 'pro_plus']),
        amount: z.number(), // in ZAR
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Amount in kobo (1 ZAR = 100 kobo)
        const amountInKobo = Math.round(input.amount * 100);

        const response = await initializePayment(
          ctx.user.email || 'user@tracecore.ai',
          amountInKobo,
          {
            workspaceId: input.workspaceId,
            tier: input.tier,
            userId: ctx.user.id,
          }
        );

        return {
          success: response.status,
          authorizationUrl: response.data?.authorization_url,
          reference: response.data?.reference,
        };
      } catch (error) {
        console.error('[Billing] Initialize payment error:', error);
        throw new Error('Failed to initialize payment');
      }
    }),

  /**
   * Verify payment and activate subscription
   */
  verifyPayment: protectedProcedure
    .input(
      z.object({
        reference: z.string(),
        workspaceId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const paymentData = await verifyPayment(input.reference);

        if (!paymentData.data || paymentData.data.status !== 'success') {
          throw new Error('Payment verification failed');
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');

        // Record the payment
        const tier = (paymentData.data as any).metadata?.tier || 'pro';
        const monthlyAmount = paymentData.data.amount / 100; // Convert from kobo to ZAR

        // Create or update subscription
        const existingSubscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.workspaceId, input.workspaceId))
          .limit(1);

        if (existingSubscription.length > 0) {
          // Update existing subscription
          await db
            .update(subscriptions)
            .set({
              tier: tier as any,
              status: 'active',
              paystackReference: input.reference,
              monthlyAmount: Math.round(monthlyAmount),
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existingSubscription[0].id));
        } else {
          // Create new subscription
          await db.insert(subscriptions).values({
            workspaceId: input.workspaceId,
            tier: tier as any,
            status: 'active',
            paystackReference: input.reference,
            monthlyAmount: Math.round(monthlyAmount),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }

        // Record payment
        await db.insert(payments).values({
          workspaceId: input.workspaceId,
          amount: paymentData.data.amount,
          currency: 'ZAR',
          status: 'completed',
          paystackReference: input.reference,
          paymentMethod: 'card',
        });

        return {
          success: true,
          message: 'Subscription activated successfully',
          tier,
        };
      } catch (error) {
        console.error('[Billing] Verify payment error:', error);
        throw new Error('Failed to verify payment');
      }
    }),

  /**
   * Get current subscription status
   */
  getSubscription: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const subscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.workspaceId, input.workspaceId))
          .limit(1);

        return subscription[0] || null;
      } catch (error) {
        console.error('[Billing] Get subscription error:', error);
        throw new Error('Failed to fetch subscription');
      }
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        await db
          .update(subscriptions)
          .set({
            status: 'cancelled',
            cancelledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.workspaceId, input.workspaceId));

        return { success: true, message: 'Subscription cancelled' };
      } catch (error) {
        console.error('[Billing] Cancel subscription error:', error);
        throw new Error('Failed to cancel subscription');
      }
    }),
});
