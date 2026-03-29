import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";

export const aiRouter = router({
  /**
   * Chat with AI - send message and get response
   */
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        conversationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Invoke LLM with user message
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are TraceCore AI, a helpful assistant for supply chain management. Help users manage their inventory, orders, products, and suppliers. Be concise and actionable.",
            },
            {
              role: "user",
              content: input.message,
            },
          ],
        });

        const assistantMessage =
          response.choices[0]?.message?.content || "No response";

        return {
          success: true,
          message: assistantMessage,
          conversationId: input.conversationId || "default",
        };
      } catch (error) {
        console.error("[AI Chat Error]", error);
        return {
          success: false,
          message: "Failed to process your message. Please try again.",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Transcribe audio to text
   */
  transcribe: protectedProcedure
    .input(
      z.object({
        audioUrl: z.string().url(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: input.language,
        });

        if ("error" in result) {
          return {
            success: false,
            error: result.error,
          };
        }

        return {
          success: true,
          text: result.text,
          language: result.language || "en",
        };
      } catch (error) {
        console.error("[Transcription Error]", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Transcription failed",
        };
      }
    }),

  /**
   * Execute voice command with NLP parsing
   */
  executeCommand: protectedProcedure
    .input(
      z.object({
        command: z.string(),
        parameters: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const commandLower = input.command.toLowerCase();
        const words = commandLower.split(/\s+/);

        // Intent parsing with regex patterns
        const intents: Record<string, RegExp> = {
          add_product: /add|create.*product/,
          create_order: /create|new.*order|order.*for/,
          update_status: /update|mark.*status|mark.*as/,
          check_inventory: /inventory|stock|check.*stock/,
          sales_report: /sales|revenue|report/,
          list_suppliers: /list|show.*supplier|suppliers/,
          production_run: /production|start.*run|create.*run/,
          shipment: /ship|shipment|track/,
        };

        let matchedIntent: string | null = null;
        for (const [intent, pattern] of Object.entries(intents)) {
          if (pattern.test(commandLower)) {
            matchedIntent = intent;
            break;
          }
        }

        // Extract parameters from command
        const parameters: Record<string, string> = {};
        if (commandLower.includes("for")) {
          const forIndex = words.indexOf("for");
          if (forIndex !== -1) {
            parameters.target = words.slice(forIndex + 1).join(" ");
          }
        }

        // Command execution with context
        const responses: Record<string, string> = {
          add_product:
            "Ready to add a new product. What is the product name and cost?",
          create_order:
            "Creating order. Who is the customer and what products do they need?",
          update_status:
            "Which item would you like to update and what status?",
          check_inventory:
            "Checking inventory levels across all products...",
          sales_report:
            "Generating sales analytics for the current period...",
          list_suppliers:
            "Retrieving supplier list with performance metrics...",
          production_run:
            "Starting production run. Which product and quantity?",
          shipment: "Processing shipment. Which order and carrier?",
        };

        if (matchedIntent && responses[matchedIntent]) {
          return {
            success: true,
            action: matchedIntent,
            message: responses[matchedIntent],
            parameters,
          };
        }

        return {
          success: false,
          message: `I didn't understand that command. Try: "Add product", "Create order", "Update status", "Check inventory", "Show sales", or "List suppliers"`,
        };
      } catch (error) {
        console.error("[Command Execution Error]", error);
        return {
          success: false,
          message: "Failed to execute command. Please try again.",
        };
      }
    }),

  /**
   * Get available commands
   */
  getCommands: protectedProcedure.query(async () => {
    return {
      commands: [
        {
          id: "add_product",
          name: "Add Product",
          description: "Add a new product to inventory",
          examples: ["Add product", "Create product"],
        },
        {
          id: "create_order",
          name: "Create Order",
          description: "Create a new customer order",
          examples: ["Create order", "New order"],
        },
        {
          id: "update_status",
          name: "Update Status",
          description: "Update order or shipment status",
          examples: ["Update status", "Mark as shipped"],
        },
        {
          id: "check_inventory",
          name: "Check Inventory",
          description: "View current inventory levels",
          examples: ["Check inventory", "Show stock"],
        },
        {
          id: "sales_report",
          name: "Sales Report",
          description: "Generate sales analytics",
          examples: ["Show sales", "Revenue report"],
        },
        {
          id: "list_suppliers",
          name: "List Suppliers",
          description: "View all suppliers",
          examples: ["List suppliers", "Show suppliers"],
        },
        {
          id: "production_run",
          name: "Production Run",
          description: "Start a production run",
          examples: ["Start production", "New production run"],
        },
        {
          id: "shipment",
          name: "Shipment",
          description: "Process shipment",
          examples: ["Ship order", "Track shipment"],
        },
      ],
    };
  }),
});
