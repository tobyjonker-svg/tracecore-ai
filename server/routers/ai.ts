import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const aiRouter = router({
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await db.getWorkspaceByUserId(ctx.user.id);
        if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

        const [products, orders, inputs, suppliers, runs] = await Promise.all([
          db.getProductsByWorkspace(workspace.id),
          db.getOrders(workspace.id),
          db.getInputsByWorkspace(workspace.id),
          db.getSuppliers(workspace.id),
          db.getProductionRuns(workspace.id),
        ]);

        const totalRevenue = (orders as any[]).reduce((s: number, o: any) => s + parseFloat(o.totalPrice || 0), 0);
        const pendingOrders = (orders as any[]).filter((o: any) => o.status === 'pending' || o.status === 'processing').length;
        const lowStock = (products as any[]).filter((p: any) => p.currentStock <= (p.lowStockThreshold || 10));
        const activeRuns = (runs as any[]).filter((r: any) => r.status === 'in_progress' || r.status === 'planned').length;

        const businessContext = [
          "You are the AI business partner and voice command processor for " + workspace.name + " using TraceCore AI.",
          "",
          "LIVE BUSINESS DATA:",
          "- Products: " + (products as any[]).length + " | Low stock: " + (lowStock.length > 0 ? lowStock.map((p: any) => p.name + " (" + p.currentStock + " " + p.unit + ")").join(", ") : "none"),
          "- Orders: " + (orders as any[]).length + " | Pending/Processing: " + pendingOrders + " | Revenue: R" + totalRevenue.toFixed(2),
          "- Raw Inputs: " + (inputs as any[]).length + " | Suppliers: " + (suppliers as any[]).length,
          "- Production Runs: " + (runs as any[]).length + " | Active: " + activeRuns,
          "",
          "PRODUCTS: " + (products as any[]).map((p: any) => p.name + " (id:" + p.id + ", stock:" + p.currentStock + " " + p.unit + ", price:R" + p.sellingPrice + ")").join(" | "),
          "SUPPLIERS: " + (suppliers as any[]).map((s: any) => s.name + " (id:" + s.id + ")").join(" | "),
          "RAW INPUTS: " + (inputs as any[]).map((i: any) => i.name + " (id:" + i.id + ", stock:" + i.currentStock + " " + i.unit + ")").join(" | "),
          "ORDERS: " + (orders as any[]).slice(0, 10).map((o: any) => "#" + o.orderNumber + " id:" + o.id + " " + o.customerName + " " + o.status).join(" | "),
          "",
          "You have TWO modes:",
          "1. BUSINESS ANALYSIS: Answer questions about the business, give insights and advice.",
          "2. ACTION COMMANDS: When the user asks you to DO something, return a JSON action block.",
          "",
          "For actions, respond with this exact format:",
          '{"action": "ACTION_TYPE", "params": {...}, "confirm": "Human readable confirmation message"}',
          "",
          "Available actions:",
          '- {"action": "UPDATE_ORDER_STATUS", "params": {"orderId": 123, "status": "shipped"}, "confirm": "Marked order #420 as shipped"}',
          '- {"action": "ADD_INPUT_STOCK", "params": {"inputId": 123, "quantity": 500}, "confirm": "Added 500g to Lions Mane Powder"}',
          '- {"action": "CREATE_PRODUCTION_RUN", "params": {"productId": 123, "quantity": 20, "notes": "..."}, "confirm": "Started production run for 20 bottles of Lions Mane"}',
          '- {"action": "UPDATE_PRODUCT_STOCK", "params": {"productId": 123, "stock": 50}, "confirm": "Updated Lions Mane stock to 50 units"}',
          "",
          "If the user says something like 'mark all orders as shipped', return multiple actions as an array:",
          '[{"action": "UPDATE_ORDER_STATUS", "params": {"orderId": 11, "status": "shipped"}, "confirm": "..."}, ...]',
          "",
          "For non-action questions, just respond normally as a business partner.",
          "Be concise, direct, and helpful.",
        ].join("\n");

        const messages = [
          ...(input.conversationHistory || []),
          { role: "user" as const, content: input.message }
        ];

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY || "",
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: businessContext,
            messages,
          }),
        });

        const data = await response.json() as any;
        if (!response.ok) throw new Error(data.error?.message || "AI request failed");

        const assistantMessage = data.content?.[0]?.text || "No response";

        // Check if response contains an action
        let actions = null;
        try {
          const trimmed = assistantMessage.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            actions = JSON.parse(trimmed);
            if (!Array.isArray(actions)) actions = [actions];
          }
        } catch(e) {}

        return { success: true, message: assistantMessage, actions };
      } catch (error) {
        console.error("[AI Chat Error]", error);
        return { success: false, message: "Failed to get AI response. Please try again." };
      }
    }),

  getCommands: protectedProcedure.query(async () => ({ commands: [] })),
  transcribe: protectedProcedure
    .input(z.object({ audioUrl: z.string(), language: z.string().optional() }))
    .mutation(async () => ({ success: false, error: "Use browser speech recognition" })),
  executeCommand: protectedProcedure
    .input(z.object({ command: z.string(), parameters: z.record(z.string(), z.any()).optional() }))
    .mutation(async () => ({ success: false, message: "Use AI Chat instead" })),
});
