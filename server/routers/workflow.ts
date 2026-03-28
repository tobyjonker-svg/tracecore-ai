/**
 * Workflow Router
 * tRPC procedures for workflow management and analytics
 */

import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import {
  getWorkflowStages,
  saveWorkflowStages,
  trackWorkflowAnalytics,
  getWorkflowAnalytics,
  getWorkflowAnalyticsSummary,
} from '../db';

const WorkflowStageSchema = z.object({
  name: z.string().min(1, 'Stage name is required'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
});

export const workflowRouter = router({
  /**
   * Get user's saved workflow stages
   */
  getStages: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input }) => {
      return getWorkflowStages(input.workspaceId);
    }),

  /**
   * Save user's workflow stages
   */
  saveStages: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        stages: z.array(WorkflowStageSchema).min(1, 'At least one stage is required'),
      })
    )
    .mutation(async ({ input }) => {
      return saveWorkflowStages(input.workspaceId, input.stages);
    }),

  /**
   * Track workflow template selection and customization
   */
  trackUsage: publicProcedure
    .input(
      z.object({
        workspaceId: z.number().optional(),
        templateUsed: z.string(),
        customizationCount: z.number().default(0),
        stagesCount: z.number(),
        source: z.string().default('landing'),
      })
    )
    .mutation(async ({ input }) => {
      return trackWorkflowAnalytics(
        input.workspaceId,
        input.templateUsed,
        input.customizationCount,
        input.stagesCount,
        input.source
      );
    }),

  /**
   * Get workflow analytics (admin only)
   */
  getAnalytics: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ ctx, input }) => {
      // Only admins can view analytics
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      return getWorkflowAnalytics(input.limit);
    }),

  /**
   * Get workflow analytics summary (admin only)
   */
  getAnalyticsSummary: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can view analytics
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return getWorkflowAnalyticsSummary();
  }),
});
