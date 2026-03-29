import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Filter, Search } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  command: string;
  parameters: Record<string, string>;
  status: "success" | "error" | "pending";
  result: string;
  duration: number;
  ipAddress: string;
}

export function CommandAuditLog() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 3600000),
      user: "admin@example.com",
      command: "Create Order",
      parameters: { customer: "John Smith", quantity: "100", product: "Vitamin Capsules" },
      status: "success",
      result: "Order ORD-001 created successfully",
      duration: 1.2,
      ipAddress: "192.168.1.100",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 7200000),
      user: "manager@example.com",
      command: "Check Inventory",
      parameters: { product: "Vitamin Powder" },
      status: "success",
      result: "Current stock: 500 units",
      duration: 0.8,
      ipAddress: "192.168.1.101",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 10800000),
      user: "staff@example.com",
      command: "Update Status",
      parameters: { orderId: "ORD-001", status: "shipped" },
      status: "success",
      result: "Order status updated to shipped",
      duration: 0.5,
      ipAddress: "192.168.1.102",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 14400000),
      user: "admin@example.com",
      command: "Delete Product",
      parameters: { productId: "PROD-999" },
      status: "error",
      result: "Permission denied: Staff cannot delete products",
      duration: 0.3,
      ipAddress: "192.168.1.100",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error" | "pending">("all");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.result.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "error":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Timestamp", "User", "Command", "Status", "Result", "Duration (s)", "IP Address"],
      ...filteredLogs.map((log) => [
        log.timestamp.toISOString(),
        log.user,
        log.command,
        log.status,
        log.result,
        log.duration.toString(),
        log.ipAddress,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8 text-primary" />
          Command Audit Log
        </h1>
        <p className="text-muted-foreground mt-1">
          Track all voice command executions for compliance and debugging
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
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
              {auditLogs.filter((log) => log.status === "success").length}
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
              {auditLogs.filter((log) => log.status === "error").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(auditLogs.reduce((sum, log) => sum + log.duration, 0) / auditLogs.length).toFixed(2)}s
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, command, or result..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>

          <div className="flex gap-2">
            {(["all", "success", "error", "pending"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              {filteredLogs.length} of {auditLogs.length} logs
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No audit logs found matching your filters
              </p>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{log.command}</p>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        {log.duration}s
                      </p>
                      <p className="text-xs text-muted-foreground">{log.ipAddress}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">User</p>
                      <p className="text-sm">{log.user}</p>
                    </div>

                    {Object.keys(log.parameters).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Parameters</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(log.parameters).map(([key, value]) => (
                            <code
                              key={key}
                              className="text-xs bg-muted px-2 py-1 rounded"
                            >
                              {key}: {value}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Result</p>
                      <p className="text-sm text-muted-foreground">{log.result}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
