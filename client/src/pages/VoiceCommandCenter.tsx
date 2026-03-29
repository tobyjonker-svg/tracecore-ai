import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Mic, CheckCircle, AlertCircle, Clock } from "lucide-react";

export function VoiceCommandCenter() {
  const [commandHistory, setCommandHistory] = useState<Array<{
    id: string;
    command: string;
    status: "success" | "error" | "pending";
    timestamp: Date;
    result?: string;
  }>>([]);

  const getCommandsMutation = trpc.ai.getCommands.useQuery();
  const executeCommandMutation = trpc.ai.executeCommand.useMutation();

  const handleQuickCommand = async (command: string) => {
    const id = Date.now().toString();
    setCommandHistory((prev) => [
      {
        id,
        command,
        status: "pending",
        timestamp: new Date(),
      },
      ...prev,
    ]);

    try {
      const response = await executeCommandMutation.mutateAsync({
        command,
      });

      setCommandHistory((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: response.success ? "success" : "error",
                result: response.message,
              }
            : item
        )
      );
    } catch (error) {
      setCommandHistory((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "error",
                result: "Failed to execute command",
              }
            : item
        )
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mic className="w-8 h-8 text-primary" />
          Voice Command Center
        </h1>
        <p className="text-muted-foreground mt-1">
          Execute commands and view command history
        </p>
      </div>

      {/* Quick Commands */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Commands</CardTitle>
          <CardDescription>
            Click to execute common commands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleQuickCommand("Add product")}
              disabled={executeCommandMutation.isPending}
              className="justify-start"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickCommand("Create order")}
              disabled={executeCommandMutation.isPending}
              className="justify-start"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Order
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickCommand("Check inventory")}
              disabled={executeCommandMutation.isPending}
              className="justify-start"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Check Inventory
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickCommand("Show sales report")}
              disabled={executeCommandMutation.isPending}
              className="justify-start"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Sales Report
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickCommand("Update status")}
              disabled={executeCommandMutation.isPending}
              className="justify-start"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Update Status
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickCommand("List suppliers")}
              disabled={executeCommandMutation.isPending}
              className="justify-start"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              List Suppliers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Commands */}
      {getCommandsMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle>Available Commands</CardTitle>
            <CardDescription>
              All voice and text commands you can use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getCommandsMutation.data.commands.map((cmd) => (
                <div
                  key={cmd.id}
                  className="p-3 rounded-lg bg-accent/10 border border-accent/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{cmd.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cmd.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        Try: {cmd.examples.join(", ")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleQuickCommand(cmd.examples[0])}
                      disabled={executeCommandMutation.isPending}
                    >
                      Try
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Command History */}
      <Card>
        <CardHeader>
          <CardTitle>Command History</CardTitle>
          <CardDescription>
            Recent commands executed ({commandHistory.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commandHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No commands executed yet. Try a quick command above!
            </p>
          ) : (
            <div className="space-y-2">
              {commandHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="mt-1">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.command}</p>
                    {item.result && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.result}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
