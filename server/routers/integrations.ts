import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { getDb } from "../db";

export const integrationsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
      const result = await (await getDb()).execute(sql`SELECT * FROM woocommerceIntegrations WHERE workspaceId = ${workspace.id} LIMIT 1`);
      const rows = (result as any)[0] ?? result;
      return rows[0] || null;
    } catch (error) {
      console.error("[Integrations] Get error:", error);
      return null;
    }
  }),

  save: protectedProcedure
    .input(z.object({
      storeUrl: z.string().optional(),
      consumerKey: z.string().optional(),
      consumerSecret: z.string().optional(),
      webhookSecret: z.string().optional(),
      courierGuyApiKey: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const existing = await (await getDb()).execute(sql`SELECT id FROM woocommerceIntegrations WHERE workspaceId = ${workspace.id} LIMIT 1`);
        const rows = (existing as any)[0] ?? existing;

        if (rows[0]) {
          await (await getDb()).execute(sql`
            UPDATE woocommerceIntegrations SET
              storeUrl = ${input.storeUrl || ''},
              consumerKey = ${input.consumerKey || ''},
              consumerSecret = ${input.consumerSecret || ''},
              webhookSecret = ${input.webhookSecret || ''},
              courierGuyApiKey = ${input.courierGuyApiKey || ''},
              isActive = 1
            WHERE workspaceId = ${workspace.id}
          `);
        } else {
          await (await getDb()).execute(sql`
            INSERT INTO woocommerceIntegrations (workspaceId, storeUrl, consumerKey, consumerSecret, webhookSecret, courierGuyApiKey, isActive)
            VALUES (${workspace.id}, ${input.storeUrl || ''}, ${input.consumerKey || ''}, ${input.consumerSecret || ''}, ${input.webhookSecret || ''}, ${input.courierGuyApiKey || ''}, 1)
          `);
        }
        return { success: true };
      } catch (error) {
        console.error("[Integrations] Save error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save integrations" });
      }
    }),

  testWooCommerce: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
      const result = await (await getDb()).execute(sql`SELECT * FROM woocommerceIntegrations WHERE workspaceId = ${workspace.id} LIMIT 1`);
      const rows = (result as any)[0] ?? result;
      const integration = rows[0];
      if (!integration?.storeUrl || !integration?.consumerKey) {
        return { success: false, message: "No WooCommerce credentials saved yet" };
      }
      const url = integration.storeUrl.replace(/\/$/, '') + '/wp-json/wc/v3/orders?per_page=1';
      const auth = Buffer.from(`${integration.consumerKey}:${integration.consumerSecret}`).toString('base64');
      const res = await fetch(url, { headers: { 'Authorization': `Basic ${auth}` } });
      if (res.ok) return { success: true, message: "Connected successfully!" };
      return { success: false, message: "Connection failed — check your credentials" };
    } catch (e) {
      return { success: false, message: "Connection failed — check your store URL" };
    }
  }),

  testCourierGuy: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const workspace = await db.getWorkspaceByUserId(ctx.user.id);
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
      const result = await (await getDb()).execute(sql`SELECT courierGuyApiKey FROM woocommerceIntegrations WHERE workspaceId = ${workspace.id} LIMIT 1`);
      const rows = (result as any)[0] ?? result;
      const apiKey = rows[0]?.courierGuyApiKey;
      if (!apiKey) return { success: false, message: "No Courier Guy API key saved yet" };
      const res = await fetch('https://api.shiplogic.com/shipments', { headers: { 'Authorization': `Bearer ${apiKey}` } });
      if (res.ok) return { success: true, message: "Connected successfully!" };
      return { success: false, message: "Invalid API key" };
    } catch (e) {
      return { success: false, message: "Connection failed" };
    }
  }),
});
