import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

const createInputSchema = z.object({
  name: z.string().min(1, "Input name is required"),
  description: z.string().optional(),
  supplierId: z.number().optional(),
  costPerUnit: z.number().positive("Cost must be positive"),
  unit: z.string().default("kg"),
});

const updateInputSchema = createInputSchema.extend({
  id: z.number(),
});

export const inputsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User has no workspace",
        });
      }

      return await db.getInputsByWorkspace(workspace.id);
    } catch (error) {
      console.error("[Inputs] Failed to list inputs:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch inputs",
      });
    }
  }),

  create: protectedProcedure
    .input(createInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User has no workspace",
          });
        }

        return await db.createInput({
          workspaceId: workspace.id as any,
          name: input.name,
          description: input.description,
          supplierId: input.supplierId,
          costPerUnit: input.costPerUnit as any,
          unit: input.unit,
        });
      } catch (error) {
        console.error("[Inputs] Failed to create input:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create input",
        });
      }
    }),

  update: protectedProcedure
    .input(updateInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User has no workspace",
          });
        }

        // Verify input belongs to workspace
        const existingInput = await db.getInputById(input.id);
        if (!existingInput || existingInput.workspaceId !== workspace.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Input not found",
          });
        }

        return await db.updateInput(input.id, {
          name: input.name,
          description: input.description,
          supplierId: input.supplierId,
          costPerUnit: input.costPerUnit as any,
          unit: input.unit,
        });
      } catch (error) {
        console.error("[Inputs] Failed to update input:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update input",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User has no workspace",
          });
        }

        // Verify input belongs to workspace
        const existingInput = await db.getInputById(input.id);
        if (!existingInput || existingInput.workspaceId !== workspace.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Input not found",
          });
        }

        return await db.deleteInput(input.id);
      } catch (error) {
        console.error("[Inputs] Failed to delete input:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete input",
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User has no workspace",
          });
        }

        const input_data = await db.getInputById(input.id);
        if (!input_data || input_data.workspaceId !== workspace.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Input not found",
          });
        }

        return input_data;
      } catch (error) {
        console.error("[Inputs] Failed to get input:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch input",
        });
      }
    }),
});
