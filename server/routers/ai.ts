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

        if ('error' in result) {
          return {
            success: false,
            error: result.error,
          };
        }

        return {
          success: true,
          text: result.text,
          language: result.language || 'en',
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
   * Execute voice command
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
        // Parse command and execute
        const commandLower = input.command.toLowerCase();

        // Command handlers
        if (
          commandLower.includes("add product") ||
          commandLower.includes("create product")
        ) {
          return {
            success: true,
            action: "add_product",
            message: "Ready to add a new product. What is the product name?",
          };
        }

        if (
          commandLower.includes("create order") ||
          commandLower.includes("new order")
        ) {
          return {
            success: true,
            action: "create_order",
            message: "Ready to create an order. What is the customer name?",
          };
        }

        if (
          commandLower.includes("update status") ||
          commandLower.includes("mark as")
        ) {
          return {
            success: true,
            action: "update_status",
            message: "What would you like to update the status to?",
          };
        }

        if (
          commandLower.includes("inventory") ||
          commandLower.includes("stock")
        ) {
          return {
            success: true,
            action: "check_inventory",
            message: "Fetching inventory information...",
          };
        }

        if (
          commandLower.includes("sales") ||
          commandLower.includes("revenue")
        ) {
          return {
            success: true,
            action: "sales_report",
            message: "Generating sales report...",
          };
        }

        return {
          success: false,
          message: `I didn't understand that command. Try: "Add product", "Create order", "Update status", "Check inventory", or "Show sales"`,
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
  getCommands: protectedProcedure.query(async ({ ctx }) => {
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
      ],
    };
  }),
});
