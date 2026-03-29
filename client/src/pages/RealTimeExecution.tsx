import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Play, Pause, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";

interface ExecutionLog {
  id: string;
  command: string;
  status: "pending" | "running" | "success" | "error";
  startTime: Date;
  endTime?: Date;
  result?: string;
  progress?: number;
}

export function RealTimeExecution() {
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [commandInput, setCommandInput] = useState("");
  const [isConnected, setIsConnected] = useState(true);

  const executeCommandMutation = trpc.ai.executeCommand.useMutation();

  const handleExecuteCommand = async () => {
    if (!commandInput.trim()) return;

    const executionId = Date.now().toString();
    const newLog: ExecutionLog = {
      id: executionId,
      command: commandInput,
      status: "pending",
      startTime: new Date(),
      progress: 0,
    };

    setExecutionLogs((prev) => [newLog, ...prev]);

    try {
      // Simulate real-time progress updates
      setExecutionLogs((prev) =>
        prev.map((log) =>
          log.id === executionId
            ? { ...log, status: "running", progress: 25 }
            : log
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      setExecutionLogs((prev) =>
        prev.map((log) =>
          log.id === executionId
            ? { ...log, progress: 50 }
            : log
        )
      );

      const response = await executeCommandMutation.mutateAsync({
        command: commandInput,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      setExecutionLogs((prev) =>
        prev.map((log) =>
          log.id === executionId
            ? {
                ...log,
                status: response.success ? "success" : "error",
                progress: 100,
                endTime: new Date(),
                result: response.message,
              }
            : log
        )
      );

      setCommandInput("");
    } catch (error) {
      setExecutionLogs((prev) =>
        prev.map((log) =>
          log.id === executionId
            ? {
                ...log,
                status: "error",
                endTime: new Date(),
                result: "Failed to execute command",
              }
            : log
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
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = (endTime.getTime() - start.getTime()) / 1000;
    return `${duration.toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="w-8 h-8 text-primary" />
          Real-Time Command Execution
        </h1>
        <p className="text-muted-foreground mt-1">
          Execute voice commands with live status updates
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              WebSocket: {isConnected ? "Active" : "Inactive"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Command Input */}
      <Card>
        <CardHeader>
          <CardTitle>Execute Command</CardTitle>
          <CardDescription>
            Enter a voice command to execute in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Create order for customer X with 100 units"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleExecuteCommand();
                }
              }}
              disabled={executeCommandMutation.isPending}
            />
            <Button
              onClick={handleExecuteCommand}
              disabled={
                !commandInput.trim() || executeCommandMutation.isPending
              }
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Execute
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>
            Real-time command execution logs ({executionLogs.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {executionLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No commands executed yet. Try executing a command above!
            </p>
          ) : (
            <div className="space-y-3">
              {executionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getStatusIcon(log.status)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm break-words">
                          {log.command}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Started: {log.startTime.toLocaleTimeString()}
                        </p>
                        {log.endTime && (
                          <p className="text-xs text-muted-foreground">
                            Duration: {getDuration(log.startTime, log.endTime)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground ml-2">
                      {log.progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        log.status === "success"
                          ? "bg-green-500"
                          : log.status === "error"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${log.progress}%` }}
                    />
                  </div>

                  {log.result && (
                    <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                      {log.result}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Executed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executionLogs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {executionLogs.filter((log) => log.status === "success").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {executionLogs.filter((log) => log.status === "error").length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
