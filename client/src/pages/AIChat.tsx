import { useState } from "react";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hello! I'm TraceCore AI. I can help you manage your inventory, orders, products, and suppliers. Try asking me things like:\n\n• Add a new product\n• Create an order\n• Check inventory levels\n• Show sales report\n• Update shipment status",
    },
  ]);

  const chatMutation = trpc.ai.chat.useMutation();
  const getCommandsMutation = trpc.ai.getCommands.useQuery();

  const handleSendMessage = async (content: string) => {
    // Add user message to chat
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Send to AI
      const response = await chatMutation.mutateAsync({
        message: content,
      });

      if (response.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: String(response.message),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: "assistant",
          content: String(response.message || "Failed to process your message"),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground mt-1">
          Chat with TraceCore AI to manage your supply chain
        </p>
      </div>

      {/* Chat Interface */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={chatMutation.isPending}
            placeholder="Ask me anything about your inventory, orders, or products..."
            height={600}
          />
        </CardContent>
      </Card>

      {/* Available Commands */}
      {getCommandsMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle>Available Commands</CardTitle>
            <CardDescription>
              You can use these voice or text commands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getCommandsMutation.data.commands.map((cmd) => (
                <div key={cmd.id} className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <h3 className="font-medium text-sm">{cmd.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cmd.description}
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Examples: {cmd.examples.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
