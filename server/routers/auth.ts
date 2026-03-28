/**
 * Auth Router — Signup and authentication procedures
 * Handles user registration, login, and session management
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../_core/trpc';
import {
  createUserWithSignup,
  getUserByEmail,
  getWorkspaceByUserId,
  getWorkspacesByUserId,
} from '../db';

/**
 * Signup validation schema
 */
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(1, 'Business name is required'),
  workflowTemplate: z.string().min(1, 'Workflow template is required'),
  workflowStages: z.array(
    z.object({
      name: z.string(),
      icon: z.string(),
      color: z.string(),
    })
  ),
  currency: z.string().default('ZAR'),
  region: z.string().default('ZA'),
  language: z.string().default('en'),
});

type SignupInput = z.infer<typeof signupSchema>;

export const authRouter = router({
  /**
   * Signup procedure - creates new user and workspace
   */
  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ input }) => {
      try {
        // Validate input
        const validatedInput = signupSchema.parse(input);

        // Check if email already exists
        const existingUser = await getUserByEmail(validatedInput.email);

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already registered',
          });
        }

        // Create user and workspace
        const result = await createUserWithSignup(
          validatedInput.email,
          validatedInput.businessName,
          validatedInput.workflowTemplate,
          validatedInput.workflowStages,
          validatedInput.currency,
          validatedInput.region,
          validatedInput.language
        );

        // Return success response
        return {
          success: true,
          message: 'Account created successfully',
          userId: result.userId,
          workspaceId: result.workspaceId,
          email: result.email,
          businessName: result.businessName,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Signup error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create account',
        });
      }
    }),

  /**
   * Check if email is available
   */
  checkEmailAvailable: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try {
        const user = await getUserByEmail(input.email);
        return {
          available: !user,
          email: input.email,
        };
      } catch (error) {
        console.error('Check email error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check email availability',
        });
      }
    }),

  /**
   * Get user profile (protected)
   */
  getProfile: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }

    try {
      const workspace = await getWorkspaceByUserId(ctx.user.id);

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        });
      }

      return {
        user: ctx.user,
        workspace,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get profile',
      });
    }
  }),

  /**
   * Get user's workspace with workflow details (protected)
   */


  /**
   * Get all workspaces for the current user
   */
  getWorkspaces: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }

    try {
      const workspaces = await getWorkspacesByUserId(ctx.user.id);
      return workspaces;
    } catch (error) {
      console.error('Get workspaces error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get workspaces',
      });
    }
  }),

  /**
   * Set active workspace (store in localStorage on client)
   * This is a helper - actual storage is client-side
   */
  setActiveWorkspace: publicProcedure
    .input(z.object({ workspaceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        });
      }

      try {
        const workspaces = await getWorkspacesByUserId(ctx.user.id);
        const workspace = workspaces.find(w => w.id === input.workspaceId);

        if (!workspace) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Workspace not found or not authorized',
          });
        }

        return {
          success: true,
          message: 'Active workspace set',
          workspace,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Set active workspace error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set active workspace',
        });
      }
    }),
});